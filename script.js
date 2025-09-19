// --------- Catálogo ---------
const products = [
    { id: 'brigadeiro-gourmet', name: 'Brigadeiro Gourmet', description: 'Clássico com chocolate belga, confeitado em granulados artesanais.', price: 4.5, image: 'https://images.unsplash.com/photo-1626094309830-abbb0c99da4e?auto=format&fit=crop&w=800&q=80', category: 'Docinhos' },
    { id: 'brigadeiro-colher', name: 'Brigadeiro de Colher', description: 'Cremoso, servido em potinhos personalizados de 100 g.', price: 12, image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80', category: 'Docinhos' },
    { id: 'beijinho-coco', name: 'Beijinho de Coco', description: 'Doce com coco fresco ralado e cravo da índia.', price: 4, image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80', category: 'Docinhos' },
    { id: 'brownie', name: 'Brownie Artesanal', description: 'Brownie molhadinho com pedaços de chocolate meio amargo.', price: 8, image: 'https://images.unsplash.com/photo-1589308078057-9180e27b95f2?auto=format&fit=crop&w=800&q=80', category: 'Bolos & Tortas' },
    { id: 'torta-limao', name: 'Torta de Limão', description: 'Base crocante, recheio de limão siciliano e merengue maçaricado.', price: 65, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', category: 'Bolos & Tortas' },
    { id: 'bolo-cenoura', name: 'Bolo de Cenoura com Ganache', description: 'Bolo fofinho com cobertura de chocolate meio amargo.', price: 45, image: 'https://images.unsplash.com/photo-1584792095316-26f5a4fa3c6c?auto=format&fit=crop&w=800&q=80', category: 'Bolos & Tortas' },
    { id: 'caixa-presente', name: 'Caixa Presente Gourmet', description: 'Seleção com 12 docinhos variados, perfeita para presentear.', price: 55, image: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=800&q=80', category: 'Kits Especiais' },
    { id: 'kit-festa', name: 'Kit Festa Infantil', description: '50 docinhos sortidos + 20 mini cupcakes decorados.', price: 180, image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80', category: 'Kits Especiais' },
    { id: 'mini-tartelette', name: 'Mini Tartelette de Frutas', description: 'Massa crocante com creme de baunilha e frutas frescas.', price: 6, image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80', category: 'Docinhos' },
];

// --------- Número fixo da loja ---------
const SHOP_WHATS = '5531971640029';

// --------- Helpers ---------
const $ = (s) => document.querySelector(s);

const selectors = {
    menuGrid: $('#menu-grid'),
    menuItemTemplate: $('#menu-item-template'),
    orderList: $('#order-list'),
    orderItemTemplate: $('#order-item-template'),
    emptyState: $('#order-empty'),
    totalItems: $('#total-items'),
    totalPrice: $('#total-price'),
    clearOrderBtn: $('#clear-order'),
    finishOrderBtn: $('#finish-order'),
    sendWhatsAppBtn: $('#send-whatsapp'),
    orderSection: $('#order'),
    form: $('#customer-form'),
};

let order = loadOrder();

// --------- Init ---------
renderMenu(products);
updateOrderUI();
wireEvents();

function wireEvents() {
    selectors.menuGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('button'); if (!btn) return;
        const card = btn.closest('.menu-item'); if (!card) return;
        const product = products.find((p) => p.id === card.dataset.id);
        if (product) addToOrder(product);
    });

    selectors.orderList.addEventListener('click', (e) => {
        const btn = e.target.closest('button'); if (!btn) return;
        const row = btn.closest('.order-item'); if (!row) return;
        const id = row.dataset.id; const a = btn.dataset.action;
        if (a === 'increase') changeQuantity(id, 1);
        if (a === 'decrease') changeQuantity(id, -1);
        if (a === 'remove') removeFromOrder(id);
    });

    selectors.clearOrderBtn.addEventListener('click', () => {
        if (!Object.keys(order).length) return;
        if (confirm('Tem certeza que deseja limpar todo o pedido?')) {
            order = {}; saveOrder(); updateOrderUI();
            toast('Pedido limpo.');
        }
    });

    // Rola até o "Resumo do Pedido" (id="order")
    selectors.finishOrderBtn.addEventListener('click', () => {
        if (!Object.keys(order).length) {
            alert('Adicione itens ao pedido antes de finalizar.');
            return;
        }
        // foca o bloco pra guiar o usuário
        selectors.orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        pulse(selectors.orderSection);
    });

    // Enviar para a loja
    selectors.sendWhatsAppBtn.addEventListener('click', () => {
        if (!Object.keys(order).length) {
            alert('Adicione itens ao pedido antes de enviar.');
            return;
        }
        const report = generateReport();
        const url = `https://wa.me/${SHOP_WHATS}?text=${encodeURIComponent(report)}`;
        window.open(url, '_blank');
    });

    selectors.form.addEventListener('input', saveOrder);

    window.addEventListener('storage', (ev) => {
        if (ev.key !== 'doce-arte-gourmet-cardapio') return;
        order = loadOrder(); updateOrderUI();
    });
}

// --------- UI ---------
function renderMenu(items) {
    const frag = document.createDocumentFragment();
    items.forEach((p) => {
        const el = selectors.menuItemTemplate.content.firstElementChild.cloneNode(true);
        el.dataset.id = p.id;
        el.querySelector('.menu-item__image').src = p.image;
        el.querySelector('.menu-item__image').alt = p.name;
        el.querySelector('.menu-item__title').textContent = p.name;
        el.querySelector('.menu-item__description').textContent = p.description;
        el.querySelector('.menu-item__price').textContent = formatCurrency(p.price);
        frag.appendChild(el);
    });
    selectors.menuGrid.innerHTML = '';
    selectors.menuGrid.appendChild(frag);
}

function updateOrderUI() {
    const entries = Object.values(order);
    selectors.orderList.innerHTML = '';
    if (!entries.length) {
        selectors.emptyState.style.display = 'block';
    } else {
        selectors.emptyState.style.display = 'none';
        const frag = document.createDocumentFragment();
        entries.forEach((it) => {
            const el = selectors.orderItemTemplate.content.firstElementChild.cloneNode(true);
            el.dataset.id = it.id;
            el.querySelector('.order-item__title').textContent = it.name;
            el.querySelector('.order-item__price').textContent =
                `${formatCurrency(it.price)} • Total ${formatCurrency(it.price * it.quantity)}`;
            el.querySelector('.order-item__quantity').textContent = it.quantity;
            frag.appendChild(el);
        });
        selectors.orderList.appendChild(frag);
    }
    const totals = calculateTotals();
    selectors.totalItems.textContent = totals.items;
    selectors.totalPrice.textContent = formatCurrency(totals.amount);
}

function pulse(el) {
    if (!el) return;
    el.style.transition = 'transform .22s';
    el.style.transform = 'scale(1.01)';
    setTimeout(() => el.style.transform = 'scale(1)', 240);
}

function toast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
        position: 'fixed', left: '50%', bottom: '24px', transform: 'translateX(-50%)',
        background: '#402218', color: '#fff', padding: '10px 14px', borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,.15)', zIndex: 9999, fontSize: '14px'
    });
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 1600);
    setTimeout(() => t.remove(), 2000);
}

// --------- Pedido ---------
function addToOrder(product) {
    const e = order[product.id];
    if (e) e.quantity += 1; else order[product.id] = { ...product, quantity: 1 };
    saveOrder(); updateOrderUI();
}
function changeQuantity(id, d) {
    const it = order[id]; if (!it) return;
    it.quantity += d; if (it.quantity <= 0) delete order[id];
    saveOrder(); updateOrderUI();
}
function removeFromOrder(id) { delete order[id]; saveOrder(); updateOrderUI(); }

function calculateTotals() {
    return Object.values(order).reduce((t, it) => { t.items += it.quantity; t.amount += it.quantity * it.price; return t; }, { items: 0, amount: 0 });
}

// --------- Geração do texto ---------
function generateReport() {
    const totals = calculateTotals();
    const name = ($('#customer-name')?.value || '').trim();
    const contact = ($('#customer-contact')?.value || '').trim();
    const notes = ($('#customer-notes')?.value || '').trim();

    const header = [
        'Novo pedido recebido via cardápio digital 🍫',
        name ? `Cliente: ${name}` : null,
        contact ? `Contato: ${contact}` : null,
        ''
    ].filter(Boolean).join('\n');

    const items = Object.values(order).map((it) =>
        `• ${it.name} — ${it.quantity} un. x ${formatCurrency(it.price)} = ${formatCurrency(it.quantity * it.price)}`
    ).join('\n');

    const footer = [
        '',
        `Total de itens: ${totals.items}`,
        `Valor estimado: ${formatCurrency(totals.amount)}`,
        notes ? `Observações: ${notes}` : null,
        '',
        'Responder este WhatsApp para confirmar o pedido. Obrigada! 💕'
    ].filter(Boolean).join('\n');

    return `${header}\n${items}\n${footer}`;
}

// --------- Util ---------
function formatCurrency(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
}

function saveOrder() {
    const data = {
        order,
        customer: {
            name: $('#customer-name')?.value || '',
            contact: $('#customer-contact')?.value || '',
            notes: $('#customer-notes')?.value || '',
        }
    };
    localStorage.setItem('doce-arte-gourmet-cardapio', JSON.stringify(data));
}

function loadOrder() {
    try {
        const raw = localStorage.getItem('doce-arte-gourmet-cardapio');
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        const c = parsed.customer || {};
        if ($('#customer-name')) $('#customer-name').value = c.name || '';
        if ($('#customer-contact')) $('#customer-contact').value = c.contact || '';
        if ($('#customer-notes')) $('#customer-notes').value = c.notes || '';
        return parsed.order || {};
    } catch { return {}; }
}
