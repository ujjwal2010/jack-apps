// Mock Data Store
const products = [
    { id: 1, title: 'Royal Maroon Lehenga', category: 'lehengas', originalPrice: '₹55,000', price: '₹45,000', desc: 'Exquisite bridal lehenga with heavy zari work.', featured: true },
    { id: 2, title: 'Emerald Silk Saree', category: 'sarees', originalPrice: '₹28,000', price: '₹22,000', desc: 'Pure Kanjeevaram silk saree in deep emerald green.', featured: true },
    { id: 3, title: 'Golden Zardosi Kurti', category: 'kurtis', originalPrice: '₹10,500', price: '₹8,500', desc: 'Elegant party wear kurti with intricate zardosi details.', featured: false },
    { id: 4, title: 'Midnight Blue Gown', category: 'indo-western', originalPrice: '₹38,000', price: '₹32,000', desc: 'Contemporary indo-western gown for reception evenings.', featured: true },
    { id: 5, title: 'Pastel Floral Lehenga', category: 'lehengas', originalPrice: '₹45,000', price: '₹38,000', desc: 'Lightweight organza lehenga perfect for sangeet.', featured: false },
    { id: 6, title: 'Classic Banarasi Saree', category: 'sarees', originalPrice: '₹24,000', price: '₹18,000', desc: 'Traditional red banarasi saree with gold motifs.', featured: false },
    { id: 7, title: 'Ivory Peplum Kurti Set', category: 'kurtis', originalPrice: '₹15,000', price: '₹12,000', desc: 'Modern peplum style kurti with dhoti pants.', featured: false },
    { id: 8, title: 'Velvet Draped Dress', category: 'indo-western', originalPrice: '₹32,000', price: '₹25,000', desc: 'Luxurious velvet dress with fusion draping.', featured: false }
];

const testimonials = [
    { author: 'Priya M.', text: '"The fit of my bridal lehenga was absolute perfection. Gunjan Boutique made my dream outfit a reality!"' },
    { author: 'Neha K.', text: '"Exquisite collection of sarees. The attention to detail in their custom tailoring is unmatched in Mumbai."' },
    { author: 'Ananya S.', text: '"Bought an indo-western gown for a reception. It was a showstopper. Highly recommend their designer fittings."' }
];

// Helper to generate SVG placeholders
const generateSVG = (text) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><rect width="100%" height="100%" fill="#222"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#d4af37" font-family="sans-serif" font-size="24">${text}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

// DOM Elements
const screens = document.querySelectorAll('.screen');
const navLinks = document.querySelectorAll('[data-route]');
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');
const homeFeaturedGrid = document.getElementById('home-featured-grid');
const collectionGrid = document.getElementById('collection-grid');
const productDetailContainer = document.getElementById('product-detail-container');
const filterBtns = document.querySelectorAll('.filter-btn');
const testimonialCarousel = document.getElementById('testimonial-carousel');

// Routing
function navigateTo(route, param = null) {
    // Hide all screens
    screens.forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });

    // Show target screen
    const targetScreen = document.getElementById(`screen-${route}`);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        targetScreen.classList.add('active');
    }

    // Update nav links
    document.querySelectorAll('.nav-menu a').forEach(link => {
        if (link.dataset.route === route) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Close mobile menu if open
    navMenu.classList.remove('open');

    // Handle specific route logic
    if (route === 'product' && param) {
        renderProductDetail(param);
    }

    // Scroll to top
    window.scrollTo(0,0);
}

// Event Listeners for Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = link.dataset.route;
        const param = link.dataset.id;
        navigateTo(route, param);
    });
});

// Mobile Menu Toggle
menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
});

// Render Product Card
function createProductCard(product) {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
        <img src="${generateSVG(product.title)}" alt="${product.title}" class="product-image" loading="lazy">
        <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <p class="product-price"><span class="original-price">${product.originalPrice}</span> ${product.price}</p>
            <button class="btn-primary" style="margin-top: 10px; width: 100%;" data-route="product" data-id="${product.id}">View Details</button>
        </div>
    `;
    return div;
}

// Initialize Home Screen
function initHome() {
    // Populate category SVGs
    document.getElementById('svg-lehengas').innerHTML = `<img src="${generateSVG('Lehengas')}" alt="Lehengas">`;
    document.getElementById('svg-sarees').innerHTML = `<img src="${generateSVG('Sarees')}" alt="Sarees">`;
    document.getElementById('svg-kurtis').innerHTML = `<img src="${generateSVG('Kurtis')}" alt="Kurtis">`;
    document.getElementById('svg-indo-western').innerHTML = `<img src="${generateSVG('Indo-Western')}" alt="Indo-Western">`;

    // Category click listeners
    document.querySelectorAll('.category-circle').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const filter = link.dataset.filter;
            // Update filter buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            const targetBtn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
            if(targetBtn) targetBtn.classList.add('active');

            initCollection(filter);
            navigateTo('collection');
        });
    });

    const featured = products.filter(p => p.featured);
    homeFeaturedGrid.innerHTML = '';
    featured.forEach(product => {
        homeFeaturedGrid.appendChild(createProductCard(product));
    });

    testimonialCarousel.innerHTML = '';
    testimonials.forEach(t => {
        const div = document.createElement('div');
        div.className = 'testimonial-card';
        div.innerHTML = `
            <p class="testimonial-text">${t.text}</p>
            <p class="testimonial-author">- ${t.author}</p>
        `;
        testimonialCarousel.appendChild(div);
    });
}

// Initialize Collection Screen
function initCollection(filter = 'all') {
    collectionGrid.innerHTML = '';
    const filteredProducts = filter === 'all' ? products : products.filter(p => p.category === filter);

    filteredProducts.forEach(product => {
        collectionGrid.appendChild(createProductCard(product));
    });

    // Re-attach listeners for new buttons
    collectionGrid.querySelectorAll('[data-route="product"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            navigateTo('product', btn.dataset.id);
        });
    });
}

// Filter Logic
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        initCollection(btn.dataset.filter);
    });
});

// Render Product Detail Screen
function renderProductDetail(id) {
    const product = products.find(p => p.id == id);
    if (!product) return navigateTo('collection');

    const message = encodeURIComponent(`Hi Gunjan Boutique, I am interested in ordering the ${product.title} (${product.price}). Please provide more details.`);
    const whatsappLink = `https://wa.me/919876543210?text=${message}`;

    productDetailContainer.innerHTML = `
        <div class="product-detail-image-container">
            <img src="${generateSVG(product.title)}" alt="${product.title}" class="product-detail-image">
        </div>
        <div class="product-detail-info">
            <h2>${product.title}</h2>
            <p class="product-detail-price"><span class="original-price">${product.originalPrice}</span> ${product.price}</p>
            <p class="product-detail-desc">${product.desc}</p>
            <p style="color: var(--color-text-muted); margin-bottom: var(--spacing-md);">Category: <span style="text-transform: capitalize;">${product.category.replace('-', ' ')}</span></p>
            <a href="${whatsappLink}" target="_blank" class="btn-whatsapp">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                Order via WhatsApp
            </a>
        </div>
    `;
}

// Initial Setup
initHome();
initCollection();

// Initial route
navigateTo('home');

// Attach listener for dynamic buttons in Home
homeFeaturedGrid.querySelectorAll('[data-route="product"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        navigateTo('product', btn.dataset.id);
    });
});

// Footer Navigation Links
document.querySelectorAll('.footer-links a[data-route]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.dataset.route);
    });
});
