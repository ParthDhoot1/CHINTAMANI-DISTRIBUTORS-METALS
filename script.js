document.addEventListener('DOMContentLoaded', () => {

    const STORAGE_KEY = 'chintamani_inquiries';
    const recipientMap = {
        prasad: { name: 'Mr. Prasad Dhoot', number: '919890622331' },
        roland: { name: 'Roland S. Karkada', number: '917045000500' }
    };

    function getStoredEnquiries() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            return [];
        }
    }

    function saveStoredEnquiries(enquiries) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(enquiries));
    }

    function escapeHtml(value = '') {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderEnquiries() {
        const tbody = document.getElementById('inquiryTableBody');
        if (!tbody) return;

        const enquiries = getStoredEnquiries();

        if (!enquiries.length) {
            tbody.innerHTML = '<tr><td colspan="7" style="padding: 18px; text-align: center; color: #6b7280;">No enquiries saved yet.</td></tr>';
            return;
        }

        tbody.innerHTML = enquiries.map((entry) => {
            const timestamp = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'N/A';
            const message = entry.message || 'No message provided';

            return `
                <tr style="border-top: 1px solid rgba(12, 51, 38, 0.08);">
                    <td style="padding: 14px 12px; vertical-align: top;">${escapeHtml(timestamp)}</td>
                    <td style="padding: 14px 12px; vertical-align: top;">${escapeHtml(entry.name || 'N/A')}</td>
                    <td style="padding: 14px 12px; vertical-align: top;">${escapeHtml(entry.phone || 'N/A')}</td>
                    <td style="padding: 14px 12px; vertical-align: top;">${escapeHtml(entry.email || 'N/A')}</td>
                    <td style="padding: 14px 12px; vertical-align: top;">${escapeHtml(entry.recipientName || 'N/A')}</td>
                    <td style="padding: 14px 12px; vertical-align: top;">${escapeHtml(entry.product || 'N/A')}</td>
                    <td style="padding: 14px 12px; vertical-align: top; white-space: pre-wrap;">${escapeHtml(message)}</td>
                </tr>
            `;
        }).join('');
    }

    function exportEnquiries() {
        const enquiries = getStoredEnquiries();
        const blob = new Blob([JSON.stringify(enquiries, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'chintamani-enquiries.json';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    function clearEnquiries() {
        const ok = window.confirm('Clear all saved enquiries from this browser database?');
        if (!ok) return;

        saveStoredEnquiries([]);
        renderEnquiries();
    }

    // ============================================================
    // 1. WHATSAPP FORM SUBMISSION
    // ============================================================
    const inquiryForm = document.getElementById('inquiryForm');

    inquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('formName').value.trim();
        const phone = document.getElementById('formPhone').value.trim();
        const email = document.getElementById('formEmail').value.trim();
        const recipient = document.getElementById('formRecipient').value;
        const product = document.getElementById('formProduct').value;
        const message = document.getElementById('formMessage').value.trim();

        if (!recipient) {
            alert('Please select a contact person before sending your inquiry.');
            return;
        }

        const recipientInfo = recipientMap[recipient];
        const recipientNumber = recipientInfo.number;

        const enquiry = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            name,
            phone,
            email,
            recipient,
            recipientName: recipientInfo.name,
            recipientNumber,
            product,
            message,
            timestamp: new Date().toISOString()
        };

        const enquiries = getStoredEnquiries();
        enquiries.unshift(enquiry);
        saveStoredEnquiries(enquiries);
        renderEnquiries();

        // Build the WhatsApp message
        const whatsappMessage =
            `🏭 *New Inquiry — Chintamani Distributors*\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n` +
            `👤 *Name:* ${name}\n` +
            `📞 *Phone:* ${phone}\n` +
            `📧 *Email:* ${email}\n` +
            `📦 *Product:* ${product}\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n` +
            `💬 *Message:*\n${message}\n` +
            `━━━━━━━━━━━━━━━━━━━━━`;

        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappURL = `https://wa.me/${recipientNumber}?text=${encodedMessage}`;

        // Open WhatsApp in a new tab
        window.open(whatsappURL, '_blank');

        // Show success feedback
        showFormSuccess();
    });

    function showFormSuccess() {
        const btn = document.getElementById('formSubmitBtn');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '✓ Redirecting to WhatsApp...';
        btn.style.background = '#25D366';
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            btn.disabled = false;
            inquiryForm.reset();
        }, 3000);
    }

    const exportBtn = document.getElementById('exportEnquiriesBtn');
    const clearBtn = document.getElementById('clearEnquiriesBtn');

    if (exportBtn) {
        exportBtn.addEventListener('click', exportEnquiries);
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', clearEnquiries);
    }

    renderEnquiries();

    // ============================================================
    // 2. PRODUCT MODAL
    // ============================================================
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const closeModal = modal.querySelector('.modal-close');
    const modalCta = modal.querySelector('.modal-cta');

    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        card.style.cursor = 'pointer';

        card.addEventListener('click', () => {
            const title = card.querySelector('h4').innerText;
            const info = card.getAttribute('data-info');

            modalTitle.innerText = title;
            modalText.innerText = info;

            modal.classList.add('active');
        });
    });

    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });

    // Modal CTA: scroll to contact and auto-select the product
    modalCta.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.remove('active');

        const contactSection = document.getElementById('contact');
        contactSection.scrollIntoView({ behavior: 'smooth' });

        const titleText = modalTitle.innerText.toLowerCase();
        const selectElement = document.getElementById('formProduct');

        if (titleText.includes('copper')) {
            selectElement.value = 'Copper Scrap';
        } else if (titleText.includes('brass')) {
            selectElement.value = 'Brass Scrap';
        } else if (titleText.includes('aluminium') && titleText.includes('ingot')) {
            selectElement.value = 'Aluminium Ingot';
        } else if (titleText.includes('aluminium')) {
            selectElement.value = 'Aluminium Scrap';
        } else if (titleText.includes('zinc')) {
            selectElement.value = 'Zinc Scrap';
        }
    });


    // ============================================================
    // 3. MOBILE HAMBURGER MENU
    // ============================================================
    const hamburger = document.getElementById('hamburgerBtn');
    const nav = document.getElementById('mainNav');
    const navOverlay = document.getElementById('navOverlay');

    function toggleMenu() {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
        navOverlay.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    }

    hamburger.addEventListener('click', toggleMenu);
    navOverlay.addEventListener('click', toggleMenu);

    // Close mobile menu when a link is clicked
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('active')) {
                toggleMenu();
            }
        });
    });


    // ============================================================
    // 4. SMOOTH SCROLLING FOR ALL ANCHOR LINKS
    // ============================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });


    // ============================================================
    // 5. STICKY HEADER — ADD SHADOW ON SCROLL
    // ============================================================
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });


    // ============================================================
    // 6. SCROLL REVEAL ANIMATIONS (Intersection Observer)
    // ============================================================
    const revealElements = document.querySelectorAll(
        '.about-image, .about-text, .product-category-row, .contact-info, .contact-form, .section-header, .footer-brand, .footer-links'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));


    // ============================================================
    // 7. ACTIVE NAV LINK HIGHLIGHTING ON SCROLL
    // ============================================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav ul li a:not(.nav-cta)');

    function highlightNav() {
        const scrollY = window.pageYOffset;
        const headerH = document.querySelector('header').offsetHeight;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerH - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionBottom) {
                navLinks.forEach(link => {
                    link.classList.remove('active-link');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active-link');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNav);


    // ============================================================
    // 8. BACK TO TOP (click logo scrolls to top)
    // ============================================================
    document.querySelectorAll('.logo').forEach(logo => {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

});