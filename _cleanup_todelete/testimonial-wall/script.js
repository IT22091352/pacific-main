const testimonials = [
    {
        name: "Sarah Johnson",
        role: "Marketing Director",
        text: "The service provided was absolutely exceptional. From start to finish, the attention to detail was impressive. Highly recommended for anyone looking for quality.",
        avatar: "https://randomuser.me/api/portraits/women/1.jpg"
    },
    {
        name: "David Chen",
        role: "Software Engineer",
        text: "I was blown away by the efficiency and professionalism. They truly understand what it takes to deliver a top-tier product. I'll be coming back for sure.",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg"
    },
    {
        name: "Emily Davis",
        role: "Product Manager",
        text: "Seamless integration and beautiful design. The team went above and beyond to ensure our needs were met. A fantastic experience overall.",
        avatar: "https://randomuser.me/api/portraits/women/3.jpg"
    },
    {
        name: "Michael Wilson",
        role: "Creative Director",
        text: "Stunning visuals and intuitive user experience. It's rare to find such a perfect balance of form and function. Kudos to the design team!",
        avatar: "https://randomuser.me/api/portraits/men/4.jpg"
    },
    {
        name: "Jessica Brown",
        role: "CEO, TechStart",
        text: "This platform has completely transformed how we operate. The features are robust and the support is unparalleled. 10/10 would recommend.",
        avatar: "https://randomuser.me/api/portraits/women/5.jpg"
    },
    {
        name: "Robert Taylor",
        role: "Freelance Designer",
        text: "Clean code, great documentation, and a breeze to use. This is exactly what I needed for my latest project. Thank you for this resource!",
        avatar: "https://randomuser.me/api/portraits/men/6.jpg"
    },
    {
        name: "Olivia Martinez",
        role: "Content Strategist",
        text: "I love how customizable everything is. It allowed me to create exactly what I envisioned without any hassle. Truly a game-changer.",
        avatar: "https://randomuser.me/api/portraits/women/7.jpg"
    },
    {
        name: "William Anderson",
        role: "Entrepreneur",
        text: "Fast, reliable, and aesthetically pleasing. It's helped me scale my business in ways I didn't think possible. Worth every penny.",
        avatar: "https://randomuser.me/api/portraits/men/8.jpg"
    },
    {
        name: "Sophia Thomas",
        role: "UX Researcher",
        text: "The user-centric approach is evident in every detail. It's a joy to use and has significantly improved our user engagement metrics.",
        avatar: "https://randomuser.me/api/portraits/women/9.jpg"
    }
];

// Function to create a testimonial card
function createCard(data) {
    const card = document.createElement('div');
    card.classList.add('testimonial-card');

    card.innerHTML = `
        <div class="quote-icon">
            <i class="fas fa-quote-left"></i>
        </div>
        <p class="testimonial-text">${data.text}</p>
        <div class="user-profile">
            <img src="${data.avatar}" alt="${data.name}" class="user-avatar">
            <div class="user-info">
                <span class="user-name">${data.name}</span>
                <span class="user-role">${data.role}</span>
            </div>
        </div>
    `;
    return card;
}

// Function to distribute cards across columns
function populateColumns() {
    const col1 = document.getElementById('col-1');
    const col2 = document.getElementById('col-2');
    const col3 = document.getElementById('col-3');
    const columns = [col1, col2, col3];

    // 1. Fill initial set
    testimonials.forEach((data, index) => {
        const card = createCard(data);
        columns[index % 3].appendChild(card);
    });

    // 2. Clone for infinite loop
    // We need enough clones to fill the screen + scroll distance. 
    // Simplest approach for "forever" look with CSS animation:
    // Duplicate the entire list AGAIN into the columns so the "top -50%" animation works.

    testimonials.forEach((data, index) => {
        const card = createCard(data); // Create a fresh DOM node
        columns[index % 3].appendChild(card);
    });

    // Potentially triple it if screen is very tall compared to content
    testimonials.forEach((data, index) => {
        const card = createCard(data); // Create a fresh DOM node
        columns[index % 3].appendChild(card);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    populateColumns();
});
