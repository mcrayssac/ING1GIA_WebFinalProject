// data/data.js

const sites = [
    {
      name: "Celestial Launch Complex 40",
      coordinates: [28.563, -80.580],
      description:
        "Leased from the National Air Agency, this launch complex is used for Aurora 9 missions. It was damaged in the AEROS-6 incident in September 2016 and fully repaired by December 2017.",
      openHours: "24/7 Operational",
      geometry: [
        [28.563, -80.580],
        [28.564, -80.581],
        [28.562, -80.579],
        [28.562, -80.582],
      ],
      markerType: "launch",
    },
    {
      name: "Orion West Complex",
      coordinates: [34.6300, -120.6100],
      description:
        "Located at the Orion Space Base, this complex supports polar and sun-synchronous orbit launches using Aurora 9 and Aurora Heavy vehicles.",
      openHours: "24/7 Operational",
      geometry: [
        [34.6300, -120.6100],
        [34.6310, -120.6110],
        [34.6290, -120.6090],
        [34.6285, -120.6085],
      ],
      markerType: "launch",
    },
    {
      name: "Heritage Launch Complex 39A",
      coordinates: [28.6100, -80.6050],
      description:
        "A historic launch complex leased from the National Aeronautics Agency, 39A is used for crewed missions and other high-profile launches. It features a large Horizontal Integration Facility for processing Aurora rockets.",
      openHours: "24/7 Operational",
      geometry: [
        [28.6100, -80.6050],
        [28.6110, -80.6060],
        [28.6090, -80.6040],
        [28.6085, -80.6035],
      ],
      markerType: "launch",
    },
    {
      name: "South Texas Launch Site (Starbase)",
      coordinates: [25.996, -97.155],
      description:
        "Located near Brownsville, Texas, Starbase serves as the primary testing and production facility for the Starship program. It embodies SpaceY's vision for the future of space exploration.",
      openHours: "24/7 Operational",
      geometry: [
        [25.996, -97.155],
        [25.997, -97.156],
        [25.995, -97.154],
        [25.994, -97.157],
      ],
      markerType: "launch",
    },
    {
      name: "Engine Test & Integration Facility – McGregor, Texas",
      coordinates: [30.410, -97.685],
      description:
        "A critical engine test facility where every rocket engine is rigorously evaluated before flight. It is also used for post-flight processing and refurbishment.",
      openHours: "24/7 Operational",
      geometry: [
        [30.410, -97.685],
        [30.411, -97.686],
        [30.409, -97.684],
        [30.408, -97.683],
      ],
      markerType: "test",
    },
    // Vous pouvez ajouter d'autres sites si nécessaire...
  ];
  
  const machines = [
    {
      mainPole: "Bas de la fusée",
      subPole: "Injection carburant",
      name: "Injecteur Cryogénique A1",
      pointsPerCycle: 20,
      maxUsers: 2,
      requiredGrade: "Technicien confirmé",
      availableSensors: [
        { sensorName: "Pression", requiredGrade: "Technicien confirmé" },
        { sensorName: "Flux", requiredGrade: "Technicien confirmé" },
        { sensorName: "Température", requiredGrade: "Technicien" }
      ],
      sites: [],
      currentUsers: [],
      // Pré-remplissage de usageStats avec un exemple pour le 8 avril 2025
      usageStats: [
        {
          day: new Date("2025-04-08T00:00:00Z"),
          sensorData: {
            "Pression": [
              { timestamp: new Date("2025-04-08T08:00:00Z"), value: 101, user: "607f1f77bcf86cd799439011" },
              { timestamp: new Date("2025-04-08T08:05:00Z"), value: 102, user: "607f1f77bcf86cd799439011" }
            ],
            "Flux": [
              { timestamp: new Date("2025-04-08T08:00:00Z"), value: 5.5, user: "607f1f77bcf86cd799439011" }
            ],
            "Température": [
              { timestamp: new Date("2025-04-08T08:00:00Z"), value: 20, user: "607f1f77bcf86cd799439011" }
            ]
          },
          usagePeriods: [
            { 
              user: "607f1f77bcf86cd799439011", 
              startTime: new Date("2025-04-08T07:00:00Z"), 
              endTime: new Date("2025-04-08T08:00:00Z") 
            }
          ]
        }
      ]
    },
    // Vous pouvez ajouter d'autres machines ici
  ];  
  
  const products = [
    {
      title: "Aurora 9",
      description:
        "The Aurora 9 is a two-stage rocket designed and manufactured by SpaceY for reliable transport of satellites and the Celestial spacecraft into orbit.",
      image: "/pictures/aurora9.jpg",
      categories: ["Vehicles", "Rocket"],
      badges: ["Reusable", "Heavy-lift"],
      isNew: true,
    },
    {
      title: "NovaShip",
      description:
        "NovaShip is SpaceY's fully reusable transportation system designed to carry crew and cargo to Earth orbit, the Moon, Mars, and beyond.",
      image: "/pictures/novaship.jpg",
      categories: ["Vehicles", "Spaceship"],
      badges: ["Next-gen"],
      isNew: true,
    },
    {
      title: "Nova Engine",
      description:
        "The Nova Engine is a full-flow staged combustion rocket engine developed by SpaceY for its NovaShip vehicle.",
      image: "/pictures/nova_engine.jpg",
      categories: ["Technologies", "Engine"],
      badges: ["High Performance"],
      isNew: false,
    },
    {
      title: "Celestial Capsule",
      description:
        "The Celestial Capsule is a spacecraft developed by SpaceY for transporting crew and cargo to orbital platforms and space stations.",
      image: "/pictures/celestial_capsule.jpg",
      categories: ["Vehicles", "Spaceship"],
      badges: ["Crewed"],
      isNew: false,
    },
    {
      title: "ThermoShield Technology",
      description:
        "Advanced thermo shield materials and design ensure safe re-entry of SpaceY vehicles into Earth's atmosphere.",
      image: "/pictures/thermo_shield_technology.jpg",
      categories: ["Technologies"],
      badges: ["Innovative"],
      isNew: false,
    },
  ];
  
  const statistics = [
    {
      icon: "Heart",
      title: "Total likes",
      value: "25.6K",
      iconValue: "TrendingUp",
      desc: "21% to last month",
    },
    {
      icon: "View",
      title: "Page views",
      value: "1.2M",
      iconValue: "TrendingUp",
      desc: "15% to last month",
    },
    {
      icon: "ClipboardCheck",
      title: "Mission success rate",
      value: "98%",
      iconValue: "ThumbsUp",
      desc: "Operational efficiency",
    },
    {
      icon: "Rocket",
      title: "Total launches",
      value: "448",
      iconValue: "Sparkles",
      desc: "405 successful missions",
    },
    {
      icon: "Satellite",
      title: "Satellites deployed",
      value: "2.3K",
      iconValue: "Antenna",
      desc: "Including 1.6K Starlink satellites",
    },
  ];
  
  const historyEvents = [
    {
      date: "March 15, 2002",
      title: "Foundation of Celestial Innovations",
      description:
        "Celestial Innovations was born on March 15, 2002, when a group of visionary engineers and entrepreneurs gathered with one shared dream: to make space accessible and affordable.",
      icon: "CircleCheckBig",
    },
    {
      date: "June 27, 2004",
      title: "Mercury Mk-I: The First Suborbital Test Flight",
      description:
        "Two years after its inception, Celestial Innovations achieved a major milestone with the Mercury Mk-I, its first experimental rocket designed for suborbital flight.",
      icon: "CircleCheckBig",
    },
    {
      date: "September 12, 2008",
      title: "Orion Launch Vehicle: Reaching Orbit",
      description:
        "Celestial Innovations introduced the Orion Launch Vehicle in 2008—its first rocket capable of reaching orbit.",
      icon: "CircleCheckBig",
    },
    {
      date: "November 3, 2010",
      title: "Phoenix Booster: The Reusability Breakthrough",
      description:
        "On November 3, 2010, Celestial Innovations reshaped the future of space travel with the Phoenix Booster—a breakthrough in reusable rocket technology.",
      icon: "CircleCheckBig",
    },
    {
      date: "April 18, 2012",
      title: "First Commercial Satellite Launch",
      description:
        "April 18, 2012, marked Celestial Innovations’ entrance into the commercial space market with the launch of a state-of-the-art communications satellite.",
      icon: "CircleCheckBig",
    },
    {
      date: "July 22, 2015",
      title: "Pegasus-1: The Inaugural Manned Mission",
      description:
        "Celestial Innovations launched Pegasus-1 on July 22, 2015—their first manned mission to low Earth orbit.",
      icon: "CircleCheckBig",
    },
    {
      date: "March 3, 2018",
      title: "Artemis Pathfinder: Pioneering Mars Exploration",
      description:
        "Celestial Innovations launched Artemis Pathfinder on March 3, 2018 to study Mars’s environment.",
      icon: "CircleCheckBig",
    },
    {
      date: "August 14, 2021",
      title: "Celestia Orbital Habitat: A New Era in Space Living",
      description:
        "Celestial Innovations launched Celestia—its first orbital habitat designed to support long-duration human stays.",
      icon: "CircleCheckBig",
    },
    {
      date: "December 2, 2023",
      title: "Odyssey: The Reusable Interplanetary Transport System",
      description:
        "Odyssey is a fully reusable rocket system engineered for interplanetary missions, announced on December 2, 2023.",
      icon: "CircleCheckBig",
    },
    {
      date: "Scheduled for Q3 2027",
      title: "Nova Station: The Orbital Commercial Hub",
      description:
        "Nova Station is a multipurpose orbital platform set to transform the economic landscape of space.",
      icon: "CircleEllipsis",
    },
    {
      date: "Targeted for 2029",
      title: "Lunar Gateway 2.0: Next-Generation Lunar Base",
      description:
        "Lunar Gateway 2.0 is slated to be deployed in 2029 as a next-generation habitat on the Moon.",
      icon: "CircleEllipsis",
    },
    {
      date: "Planned for 2035",
      title: "Mars Colony Initiative: Red Frontier",
      description:
        "The Mars Colony Initiative, codenamed Red Frontier, outlines an ambitious blueprint for establishing the first self-sustaining human colony on Mars.",
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
        icon: "House",
      },
      {
        title: "Products",
        url: "/products",
        icon: "Box",
        isActive: false,
        items: [
          {
            title: "Vehicles",
            url: "/products?categories=Vehicles",
            icon: "Rocket",
          },
          {
            title: "Technologies",
            url: "/products?categories=Technologies",
            icon: "Cpu",
          },
        ],
      },
      {
        title: "Sites Map",
        url: "/map",
        icon: "Map",
      },
    ],
  };
  
  const themes = [
    { name: "Light", value: "light", icon: "Sun" },
    { name: "Dark", value: "dark", icon: "Moon" },
    { name: "Cupcake", value: "cupcake" },
    { name: "Bumblebee", value: "bumblebee" },
    { name: "Emerald", value: "emerald" },
    { name: "Corporate", value: "corporate" },
    { name: "Synthwave", value: "synthwave" },
    { name: "Retro", value: "retro" },
    { name: "Cyberpunk", value: "cyberpunk" },
    { name: "Valentine", value: "valentine" },
    { name: "Halloween", value: "halloween" },
    { name: "Garden", value: "garden" },
    { name: "Forest", value: "forest" },
    { name: "Aqua", value: "aqua" },
    { name: "Lofi", value: "lofi" },
    { name: "Pastel", value: "pastel" },
    { name: "Fantasy", value: "fantasy" },
    { name: "Wireframe", value: "wireframe" },
    { name: "Black", value: "black" },
    { name: "Luxury", value: "luxury" },
    { name: "Dracula", value: "dracula" },
    { name: "Cmyk", value: "cmyk" },
    { name: "Autumn", value: "autumn" },
    { name: "Business", value: "business" },
    { name: "Acid", value: "acid" },
    { name: "Lemonade", value: "lemonade" },
    { name: "Night", value: "night" },
    { name: "Coffee", value: "coffee" },
    { name: "Winter", value: "winter" },
    { name: "Dim", value: "dim" },
    { name: "Nord", value: "nord" },
    { name: "Sunset", value: "sunset" },
  ];
  
  module.exports = { sites, machines, products, statistics, historyEvents, nextTarget, navMain, themes };
  