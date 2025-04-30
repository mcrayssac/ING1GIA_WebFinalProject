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
            title: "News",
            url: "/news",
            icon: "Newspaper",
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
const navUser = {
    title: "User",
    items: [
        {
            title: "Machines",
            url: "/machines",
            icon: "Cog",
        },
        {
            title: "Sensors",
            url: "/sensors",
            icon: "Chip",
        },
        {
            title: "Progress",
            url: "/progress",
            icon: "Trophy",
        },
        {
            title: "Users",
            url: "/users",
            icon: "Users",
        },
    ],
};

// Navigation for admin users
const navAdmin = {
    title: "Admin",
    items: [
        {
            title: "Machines",
            url: "/machines",
            icon: "Cog",
            items: [
                {
                    title: "Add Machine",
                    url: "/machinesForm",
                    icon: "Plus",
                },
            ],
        },
        {
            title: "Sensors",
            url: "/sensors",
            icon: "Chip",
            items: [
                {
                    title: "Add Sensor",
                    url: "/sensorsForm",
                    icon: "Plus",
                },
            ],
        },
        {
            title: "Tickets",
            url: "/tickets",
            icon: "Ticket",
        },
    ],
};
const navSecondary = [
    {
        title: "Support",
        url: "#",
        icon: "LifeBuoy",
    },
    {
        title: "Feedback",
        url: "#",
        icon: "Send",
    },
];

const projects = [
    {
        name: "Design Engineering",
        url: "#",
        icon: "Frame",
    },
    {
        name: "Sales & Marketing",
        url: "#",
        icon: "PieChart",
    },
    {
        name: "Travel",
        url: "#",
        icon: "Map",
    },
]

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


export { nextTarget, navMain, navSecondary, projects, themes, navUser, navAdmin };