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


export default sites;