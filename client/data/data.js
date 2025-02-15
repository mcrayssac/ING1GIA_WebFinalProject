"use client";

import { Frame, LifeBuoy, Map, PieChart, Send, Box, House, Rocket, Cpu } from "lucide-react"

const sites = [
    {
        id: 1,
        name: "Cape Canaveral SLC-40",
        coordinates: [28.561, -80.577],
        description:
            "Leased from the US Air Force, this launch complex is used for Falcon 9 missions. It was damaged in the AMOS-6 accident in September 2016 and fully repaired by December 2017.",
        openHours: "24/7 Operational",
        geometry: [
            [28.561, -80.577],
            [28.562, -80.578],
            [28.560, -80.576],
            [28.560, -80.579],
        ],
        markerType: "launch",
    },
    {
        id: 2,
        name: "Vandenberg SLC-4E",
        coordinates: [34.6324, -120.6116],
        description:
            "Located at Vandenberg Space Force Base, this complex supports polar and sun-synchronous orbit launches using Falcon 9 and Falcon Heavy vehicles.",
        openHours: "24/7 Operational",
        geometry: [
            [34.6324, -120.6116],
            [34.6334, -120.6126],
            [34.6314, -120.6106],
            [34.6320, -120.6096],
        ],
        markerType: "launch",
    },
    {
        id: 3,
        name: "Kennedy Space Center LC-39A",
        coordinates: [28.6084, -80.6043],
        description:
            "A historic launch complex leased from NASA, LC-39A is used for crewed missions and other high-profile launches. It features a large Horizontal Integration Facility for processing Falcon rockets.",
        openHours: "24/7 Operational",
        geometry: [
            [28.6084, -80.6043],
            [28.6094, -80.6053],
            [28.6074, -80.6033],
            [28.6079, -80.6063],
        ],
        markerType: "launch",
    },
    {
        id: 4,
        name: "South Texas Launch Site (Starbase)",
        coordinates: [25.9971, -97.1567],
        description:
            "Located near Brownsville, Texas, Starbase serves as the primary testing and production facility for Starship. It embodies SpaceY's vision for the future of space exploration.",
        openHours: "24/7 Operational",
        geometry: [
            [25.9971, -97.1567],
            [25.9981, -97.1577],
            [25.9961, -97.1557],
            [25.9951, -97.1570],
        ],
        markerType: "launch",
    },
    {
        id: 5,
        name: "Rocket Development & Test Facility – McGregor, Texas",
        coordinates: [30.4093, -97.6847],
        description:
            "A critical engine test facility where every rocket engine is rigorously evaluated before flight. It is also used for post-flight processing and refurbishment.",
        openHours: "24/7 Operational",
        geometry: [
            [30.4093, -97.6847],
            [30.4103, -97.6857],
            [30.4083, -97.6837],
            [30.4073, -97.6840],
        ],
        markerType: "test",
    },
    {
        id: 6,
        name: "High-Altitude Test Facility – Spaceport America, New Mexico",
        coordinates: [32.9903, -106.9750],
        description:
            "Formerly used for vertical takeoff and landing demonstrations, this facility supported early reusable launch system tests during SpaceY's development phase.",
        openHours: "Operational during test campaigns",
        geometry: [
            [32.9903, -106.9750],
            [32.9913, -106.9760],
            [32.9893, -106.9740],
            [32.9883, -106.9750],
        ],
        markerType: "test",
    },
    {
        id: 7,
        name: "SpaceY Brownsville Office",
        coordinates: [25.9975, -97.1545],
        description:
            "Situated on Boca Chica Blvd, this office is integral to SpaceY's launch activities, particularly for the Starship program.",
        openHours: "Mon-Fri: 9AM - 5PM",
        geometry: [
            [25.9975, -97.1545],
            [25.9980, -97.1550],
            [25.9970, -97.1540],
            [25.9965, -97.1535],
        ],
        markerType: "office",
    },
    {
        id: 8,
        name: "SpaceY Cape Canaveral Office",
        coordinates: [28.4720, -80.5700],
        description:
            "Located on Rocket Road, this office is pivotal for launch operations, serving as a primary site for many of SpaceY's missions.",
        openHours: "Mon-Fri: 9AM - 5PM",
        geometry: [
            [28.4720, -80.5700],
            [28.4725, -80.5705],
            [28.4715, -80.5695],
            [28.4710, -80.5690],
        ],
        markerType: "office",
    },
    {
        id: 9,
        name: "SpaceY Chantilly Office",
        coordinates: [38.8946, -77.4313],
        description:
            "Located at 14150 Newbrook Dr, this office supports various engineering and administrative functions, contributing to the company's technological advancements.",
        openHours: "Mon-Fri: 9AM - 5PM",
        geometry: [
            [38.8946, -77.4313],
            [38.8956, -77.4323],
            [38.8936, -77.4303],
            [38.8926, -77.4293],
        ],
        markerType: "office",
    },
    {
        id: 10,
        name: "SpaceY Redmond Office",
        coordinates: [47.6740, -122.1210],
        description:
            "Located at 22908 NE Alder Crest Dr, this office focuses on the development of SpaceY's Starlink satellite constellation, aiming to provide global internet coverage.",
        openHours: "Mon-Fri: 9AM - 5PM",
        geometry: [
            [47.6740, -122.1210],
            [47.6750, -122.1220],
            [47.6730, -122.1200],
            [47.6720, -122.1190],
        ],
        markerType: "office",
    },
    {
        id: 11,
        name: "SpaceY Washington Office",
        coordinates: [38.8951, -77.0365],
        description:
            "Located at 1155 F St NW, this office is essential for SpaceY's governmental and regulatory affairs, ensuring compliance and fostering partnerships.",
        openHours: "Mon-Fri: 9AM - 5PM",
        geometry: [
            [38.8951, -77.0365],
            [38.8961, -77.0375],
            [38.8941, -77.0355],
            [38.8931, -77.0345],
        ],
        markerType: "office",
    },
    {
        id: 12,
        name: "SpaceY Bastrop Office",
        coordinates: [30.1105, -97.3184],
        description:
            "A key office location in Bastrop, supporting regional operations and development efforts.",
        openHours: "Mon-Fri: 9AM - 5PM",
        geometry: [
            [30.1105, -97.3184],
            [30.1115, -97.3194],
            [30.1095, -97.3174],
            [30.1085, -97.3164],
        ],
        markerType: "office",
    },
    {
        id: 13,
        name: "SpaceY Irvine Office",
        coordinates: [33.6846, -117.8265],
        description:
            "Located in Irvine, this office is central to SpaceY's administrative and technological innovation functions.",
        openHours: "Mon-Fri: 9AM - 5PM",
        geometry: [
            [33.6846, -117.8265],
            [33.6856, -117.8275],
            [33.6836, -117.8255],
            [33.6826, -117.8245],
        ],
        markerType: "office",
    },
    {
        id: 14,
        name: "SpaceY Starbase Office",
        coordinates: [25.9971, -97.1567],
        description:
            "Situated in Texas at Starbase, this office oversees operations and supports the development of the Starship program.",
        openHours: "Mon-Fri: 9AM - 5PM",
        geometry: [
            [25.9971, -97.1567],
            [25.9981, -97.1572],
            [25.9961, -97.1557],
            [25.9951, -97.1552],
        ],
        markerType: "office",
    },
    {
        id: 15,
        name: "SpaceY Vandenberg Office",
        coordinates: [34.6444, -120.8043],
        description:
            "Located in California near Vandenberg, this office supports regional operations and strategic planning for launch activities.",
        openHours: "Mon-Fri: 9AM - 5PM",
        geometry: [
            [34.6444, -120.8043],
            [34.6454, -120.8053],
            [34.6434, -120.8033],
            [34.6424, -120.8023],
        ],
        markerType: "office",
    },
    {
        id: 16,
        name: "SpaceY Headquarters",
        coordinates: [25.9965, -97.1575],
        description:
            "Officially relocated to the Texas city of Starbase, this is the central hub of SpaceY's operations, strategy, and innovation.",
        openHours: "Mon-Fri: 9AM - 5PM",
        geometry: [
            [25.9965, -97.1575],
            [25.9975, -97.1585],
            [25.9955, -97.1565],
            [25.9945, -97.1555],
        ],
        markerType: "hq",
    },
];

const products = [
    {
        id: 1,
        title: "Falcon 9",
        description:
            "The Falcon 9 is a two-stage rocket designed and manufactured by SpaceX for reliable transport of satellites and Dragon spacecraft into orbit.",
        image:
            "/pictures/falcon9.jpg",
        categories: ["Vehicles", "Rocket"],
        badges: ["Reusable", "Heavy-lift"],
        isNew: true,
    },
    {
        id: 2,
        title: "Starship",
        description:
            "Starship is SpaceX's fully reusable transportation system designed to carry crew and cargo to Earth orbit, the Moon, Mars, and beyond.",
        image:
            "/pictures/starship.jpg",
        categories: ["Vehicles", "Spaceship"],
        badges: ["Next-gen"],
        isNew: true,
    },
    {
        id: 3,
        title: "Raptor engine",
        description:
            "The Raptor engine is a full-flow staged combustion rocket engine developed by SpaceX for its Starship vehicle.",
        image:
            "/pictures/raptor_engine.jpg",
        categories: ["Technologies", "Engine"],
        badges: ["High Performance"],
        isNew: false,
    },
    {
        id: 4,
        title: "Dragon capsule",
        description:
            "The Dragon capsule is a spacecraft developed by SpaceX for transporting crew and cargo to the International Space Station.",
        image:
            "/pictures/dragon_capsule.jpg",
        categories: ["Vehicles", "Spaceship"],
        badges: ["Crewed"],
        isNew: false,
    },
    {
        id: 5,
        title: "Heat shield technology",
        description:
            "Advanced heat shield materials and design ensure safe re-entry of SpaceX vehicles into Earth's atmosphere.",
        image:
            "/pictures/heat_shield_technology.jpg",
        categories: ["Technologies"],
        badges: ["Innovative"],
        isNew: false,
    },
];

const stats = [
    {
        id: 1,
        icon: "Heart",
        title: "Total likes",
        value: "25.6K",
        iconValue: "TrendingUp",
        desc: "21% to last month",
    },
    {
        id: 2,
        icon: "View",
        title: "Page views",
        value: "1.2M",
        iconValue: "TrendingUp",
        desc: "15% to last month",
    },
    {
        id: 3,
        icon: "ClipboardCheck",
        title: "Mission success rate",
        value: "98%",
        iconValue: "ThumbsUp",
        desc: "Operational efficiency",
    },
    {
        id: 4,
        icon: "Rocket",
        title: "Total launches",
        value: "448",
        iconValue: "Sparkles",
        desc: "405 successful missions",
    },
    {
        id: 5,
        icon: "Satellite",
        title: "Satellites deployed",
        value: "2.3K",
        iconValue: "Antenna",
        desc: "Including 1.6K Starlink satellites",
    },
];

const historyEvents = [
    {
        id: 1,
        date: "March 15, 2002",
        title: "Foundation of Celestial Innovations",
        description:
            "Celestial Innovations was born on March 15, 2002, when a group of visionary engineers and entrepreneurs gathered with one shared dream: to make space accessible and affordable. Starting out in a modest facility on the outskirts of Los Angeles, the company set its sights on revolutionizing space travel by developing advanced propulsion systems, lightweight composite materials, and innovative design philosophies. This founding moment laid the groundwork for an ambitious future—one that would eventually see the launch of fully reusable rockets and human-rated spacecraft.",
        icon: "CircleCheckBig",
    },
    {
        id: 2,
        date: "June 27, 2004",
        title: "Mercury Mk-I: The First Suborbital Test Flight",
        description:
            "Two years after its inception, Celestial Innovations achieved a major milestone with the Mercury Mk-I, its first experimental rocket designed for suborbital flight. On June 27, 2004, the Mercury Mk-I soared briefly into space, proving the viability of the company’s innovative design approach. Utilizing streamlined aerodynamics, advanced onboard computer systems, and novel composite materials, the mission delivered critical data on propulsion efficiency and structural integrity. This test flight not only validated key technologies but also set the stage for more daring missions to come.",
        icon: "CircleCheckBig",
    },
    {
        id: 3,
        date: "September 12, 2008",
        title: "Orion Launch Vehicle: Reaching Orbit",
        description:
            "Learning from early tests, Celestial Innovations introduced the Orion Launch Vehicle in 2008—its first rocket capable of reaching orbit. The Orion was a modular system designed to maximize payload efficiency while maintaining rigorous safety standards. On September 12, 2008, it successfully delivered a suite of scientific instruments into low Earth orbit, proving the company’s capability to undertake orbital missions. This achievement marked the company’s transition from experimental launches to reliable, revenue-generating operations, opening up opportunities in both commercial and governmental markets.",
        icon: "CircleCheckBig",
    },
    {
        id: 4,
        date: "November 3, 2010",
        title: "Phoenix Booster: The Reusability Breakthrough",
        description:
            "On November 3, 2010, Celestial Innovations reshaped the future of space travel with the Phoenix Booster—a breakthrough in reusable rocket technology. Engineered to perform a controlled vertical landing after completing its mission, the Phoenix Booster demonstrated advanced heat-resistant materials and precision guidance systems. Its successful recovery and refurbishment significantly reduced launch costs and underscored the company’s commitment to sustainable, environmentally friendly space exploration. This innovation set new industry benchmarks and paved the way for a new era of cost-effective space logistics.",
        icon: "CircleCheckBig",
    },
    {
        id: 5,
        date: "April 18, 2012",
        title: "First Commercial Satellite Launch",
        description:
            "April 18, 2012, marked Celestial Innovations’ entrance into the commercial space market. By launching a state-of-the-art communications satellite using the proven Orion Launch Vehicle combined with Phoenix Booster’s reusability, the company showcased its ability to deliver dependable orbital services at competitive prices. This mission validated not only the technical prowess of the company but also its business model—demonstrating that cutting-edge technology could meet the demanding schedules and budgets of commercial partners worldwide.",
        icon: "CircleCheckBig",
    },
    {
        id: 6,
        date: "July 22, 2015",
        title: "Pegasus-1: The Inaugural Manned Mission",
        description:
            "In a historic leap forward, Celestial Innovations launched Pegasus-1 on July 22, 2015—their first manned mission to low Earth orbit. Designed with comprehensive life support systems, ergonomic controls, and stringent safety protocols, Pegasus-1 carried a crew of astronauts on a mission that blended scientific research with the thrill of human spaceflight. This mission served as a proving ground for long-duration space travel, igniting public interest in space tourism and laying the technological and operational groundwork for future human exploration beyond Earth.",
        icon: "CircleCheckBig",
    },
    {
        id: 7,
        date: "March 3, 2018",
        title: "Artemis Pathfinder: Pioneering Mars Exploration",
        description:
            "Pushing the boundaries of interplanetary exploration, Celestial Innovations launched Artemis Pathfinder on March 3, 2018. This unmanned mission was meticulously designed to study Mars’s atmosphere, surface conditions, and potential landing sites for future manned missions. Equipped with autonomous landing systems and a suite of scientific instruments, Artemis Pathfinder transmitted unprecedented data back to Earth, fueling international research initiatives and solidifying the company’s reputation as a trailblazer in Mars exploration.",
        icon: "CircleCheckBig",
    },
    {
        id: 8,
        date: "August 14, 2021",
        title: "Celestia Orbital Habitat: A New Era in Space Living",
        description:
            "On August 14, 2021, Celestial Innovations pushed the envelope once again by launching Celestia—its first orbital habitat. Designed to support long-duration human stays, Celestia features modular living quarters, advanced life support systems, and on-board research laboratories. This state-of-the-art habitat serves as both a research platform and a stepping stone towards establishing a permanent human presence in orbit. It has already hosted a series of international experiments in microgravity, fostering collaboration across borders and disciplines.",
        icon: "CircleCheckBig",
    },
    {
        id: 9,
        date: "December 2, 2023",
        title: "Odyssey: The Reusable Interplanetary Transport System",
        description:
            "Unveiled on December 2, 2023, the Odyssey system represents Celestial Innovations’ most ambitious leap yet—a fully reusable rocket system engineered for interplanetary missions. Odyssey combines breakthrough propulsion technology with adaptive reentry controls and modular payload configurations to serve missions to Mars, the Moon, and beyond. This system drastically cuts the cost per launch while increasing turnaround times and mission reliability. Odyssey has redefined the logistics of deep space exploration, promising a future where routine interplanetary travel is within reach.",
        icon: "CircleCheckBig",
    },
    {
        id: 10,
        date: "Scheduled for Q3 2027",
        title: "Nova Station: The Orbital Commercial Hub",
        description:
            "Nova Station is Celestial Innovations’ next flagship project—a multipurpose orbital platform designed to serve as a commercial, research, and tourism hub in low Earth orbit. Featuring expansive docking ports, customizable laboratories, and comfortable living accommodations, Nova Station will facilitate everything from microgravity research to in-space manufacturing and private space tourism. Announced with great enthusiasm at the Global Aerospace Summit, this ambitious project is set to transform the economic landscape of space by creating a sustainable and versatile environment for commercial activities.",
        icon: "CircleEllipsis",
    },
    {
        id: 11,
        date: "Targeted for 2029",
        title: "Lunar Gateway 2.0: Next-Generation Lunar Base",
        description:
            "Building on a legacy of lunar exploration, Lunar Gateway 2.0 is slated to become the next-generation habitat on the Moon. Scheduled for deployment in 2029, this modular base will integrate cutting-edge in-situ resource utilization, energy production, and waste recycling technologies to support extended human presence. Designed to serve as both a research outpost and a logistics hub for deeper space missions, Lunar Gateway 2.0 aims to be a cornerstone of international efforts to create a sustainable human foothold on the lunar surface.",
        icon: "CircleEllipsis",
    },
    {
        id: 12,
        date: "Planned for 2035",
        title: "Mars Colony Initiative: Red Frontier",
        description:
            "Capping off Celestial Innovations’ visionary roadmap is the Mars Colony Initiative, codenamed Red Frontier. Planned for 2035, this initiative outlines an ambitious blueprint for establishing the first self-sustaining human colony on Mars. The project envisions resilient habitat modules, renewable energy systems, and innovative agricultural technologies specifically adapted for the Martian environment. Red Frontier is not only a milestone in human exploration but also a bold step toward ensuring the long-term survival and expansion of our species beyond Earth.",
        icon: "CircleEllipsis",
    },
];

const nextTarget = new Date("2025-05-05T00:00:00Z");

const navMain = {
    title: "Guests",
    items: [
        {
            title: "Home",
            url: "/",
            icon: House,
        },
        {
            title: "Products",
            url: "/products",
            icon: Box,
            isActive: false,
            items: [
                {
                    title: "Vehicles",
                    url: "/products?categories=Vehicles",
                    icon: Rocket,
                },
                {
                    title: "Technologies",
                    url: "/products?categories=Technologies",
                    icon: Cpu,
                },
            ],
        },
        {
            title: "Sites Map",
            url: "/map",
            icon: Map,
        },
    ],
};

const navSecondary = [
    {
        title: "Support",
        url: "#",
        icon: LifeBuoy,
    },
    {
        title: "Feedback",
        url: "#",
        icon: Send,
    },
];

const projects = [
    {
        name: "Design Engineering",
        url: "#",
        icon: Frame,
    },
    {
        name: "Sales & Marketing",
        url: "#",
        icon: PieChart,
    },
    {
        name: "Travel",
        url: "#",
        icon: Map,
    },
]


export { sites, products, stats, historyEvents, nextTarget, navMain, navSecondary, projects };