document.addEventListener('DOMContentLoaded', () => {
    
    // ============================================================
    // 0. LOADER / TRANSIÇÃO DE PÁGINA
    // ============================================================
    // ============================================================
    // 4. SCROLL REVEAL (Detecta quando elemento aparece na tela)
    // ============================================================
    // ============================================================
// SIDEBAR DINÂMICA
// ============================================================
    const heroTrigger = document.querySelector('.hero-trigger'); // Pega a primeira seção snap
    const sideNav = document.getElementById('depth-nav');

    if (heroTrigger && sideNav) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
            // Se a Hero Section AINDA está na tela, esconde a barra lateral
                if (entry.isIntersecting) {
                    sideNav.classList.remove('visible');
                } else {
                // Se saiu da tela (rolou pra baixo), mostra a barra
                    sideNav.classList.add('visible');
                }
            });
        }, {
            threshold: 0.3 // Ajuste fino: dispara quando 30% da hero ainda estiver lá
        });

        navObserver.observe(heroTrigger);
    }
    const observerOptions = {
        root: null, // observa em relação à viewport
        rootMargin: '0px',
        threshold: 0.2 // Dispara quando 20% do elemento estiver visível
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Adiciona a classe que faz o elemento subir e aparecer
                entry.target.classList.add('visible');
            
            // Opcional: Se quiser que anime toda vez que rolar (sai e volta),
            // remova a linha abaixo. Se quiser que anime só uma vez, mantenha.
            // observer.unobserve(entry.target); 
            } else {
            // Se quiser o efeito "Fade Out" quando sair da tela, descomente a linha abaixo:
                entry.target.classList.remove('visible');
            }
        });
    }, observerOptions);

// Seleciona todos os elementos com a classe e manda observar
    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        observer.observe(el);
    });
    window.addEventListener('load', () => {
        const loader = document.getElementById('page-loader');
        if (loader) {
            const isMapPage = document.getElementById('canvas-container');
            const delay = isMapPage ? 1500 : 500;
            
            setTimeout(() => {
                loader.classList.add('hidden');
                // Se estiver no mapa, inicia a animação de entrada (Salvador)
                if (isMapPage && typeof startMapAnimation === 'function') {
                    flyToLocation('salvador');
                }
            }, delay); 
        }
    });

    // ============================================================
    // 1. LÓGICA DE NAVEGAÇÃO
    // ============================================================
    window.navigateTo = function(url) {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.classList.remove('hidden');
            setTimeout(() => {
                window.location.href = url;
            }, 500);
        } else {
            window.location.href = url;
        }
    };

    // ============================================================
    // 2. INTERFACE GERAL
    // ============================================================
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('mousedown', () => btn.style.transform = 'scale(0.95)');
        btn.addEventListener('mouseup', () => {
            btn.style.transform = 'scale(1.05)';
            setTimeout(() => { 
                if (!btn.matches(':hover')) btn.style.transform = 'scale(1)'; 
            }, 100);
        });
    });

// ============================================================
    // 3. EFEITO PARALAXE (HOME - HERO)
    // ============================================================
    // Atualizado para o novo design Hero
    const heroContent = document.querySelector('.hero-text-wrapper');
    
    // Se o elemento Hero existir (estamos na Home) e não for mobile
    if (heroContent && window.matchMedia("(min-width: 768px)").matches) {
        document.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth - e.pageX * 2) / 100;
            const y = (window.innerHeight - e.pageY * 2) / 100;
            
            // Aplica o movimento suave
            heroContent.style.transform = `translateX(${x}px) translateY(${y}px)`;
        });
    }
    // Inicializadores de Página
    if (document.querySelector('.news-container')) initNewsPage();
    if (document.querySelector('.articles-layout')) initArticlesPage();
    if (document.getElementById('canvas-container')) init3DMap();
    
    const feedbackForm = document.getElementById('feedback-form');
    if (feedbackForm) setupFeedbackForm(feedbackForm);

    // Busca no Mapa
    const searchInput = document.getElementById('location-search');
    const searchBtn = document.getElementById('search-btn');
    if (searchInput && searchBtn) {
        const performSearch = () => {
            const query = searchInput.value.trim().toLowerCase();
            if(query) flyToLocation(query);
        };
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
});

// ============================================================
// FUNÇÕES DE NOTÍCIAS (LÊ DE DADOS.JS)
// ============================================================

async function initNewsPage() {
    // Verifica se dados.js foi carregado
    if (typeof ARQUEOLOGIA_DATA === 'undefined') {
        console.error("Lecia: ERRO CRÍTICO - Arquivo 'dados.js' não encontrado.");
        return;
    }

    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Puxa do arquivo externo
        const news = ARQUEOLOGIA_DATA.news;
        
        const featured = news.find(n => n.isFeatured);
        const others = news.filter(n => !n.isFeatured);

        if(featured) renderFeatured(featured);
        renderGrid(others);
    } catch (error) {
        console.error("Erro ao carregar notícias:", error);
    }
}

// ============================================================
// FUNÇÕES DE RENDERIZAÇÃO (ATUALIZADAS PARA DESIGN MAGAZINE)
// ============================================================

function renderFeatured(newsItem) {
    const container = document.querySelector('.featured-news');
    if(!container) return;
    
    // Novo Layout: Imagem como Background + Overlay + Conteúdo
    container.innerHTML = `
        <div class="featured-card">
            <img src="${newsItem.image}" alt="${newsItem.title}" class="featured-bg-img">
            <div class="featured-overlay"></div>
            
            <div class="featured-content">
                <span class="news-tag">Destaque do Dia</span>
                <h2 class="featured-title">${newsItem.title}</h2>
                <p class="featured-excerpt">${newsItem.summary}</p>
                <div class="card-date">
                    <i class="fa-regular fa-calendar"></i> ${newsItem.date} 
                    <span style="margin: 0 10px; opacity: 0.5;">|</span> 
                    <i class="fa-solid fa-newspaper"></i> ${newsItem.source}
                </div>
                <a href="${newsItem.url}" class="read-more" target="_blank" style="margin-top: 20px;">
                    Ler análise completa <i class="fa-solid fa-arrow-right"></i>
                </a>
            </div>
        </div>`;
}

function renderGrid(newsList) {
    const grid = document.getElementById('news-grid');
    if(!grid) return;
    grid.innerHTML = ''; 

    newsList.forEach(item => {
        const card = document.createElement('article');
        card.className = 'news-card';
        // Novo Layout de Grid: Wrapper de Imagem separado
        card.innerHTML = `
            <div class="card-image-wrapper">
                <img src="${item.image}" alt="${item.title}" class="card-image">
            </div>
            <div class="card-content">
                <div class="card-date">
                    <i class="fa-regular fa-calendar"></i> ${item.date}
                </div>
                <h3 class="card-title">${item.title}</h3>
                <p class="card-excerpt">${item.summary}</p>
                <div style="margin-bottom: 15px; font-size: 0.8rem; color: #666;">
                    Fonte: ${item.source}
                </div>
                <a href="${item.url}" class="read-more" target="_blank">
                    Ler mais <i class="fa-solid fa-arrow-right"></i>
                </a>
            </div>`;
        grid.appendChild(card);
    });
}

// ============================================================
// FUNÇÕES DE ARTIGOS (LÊ DE DADOS.JS)
// ============================================================

// ============================================================
// FUNÇÕES DE ARTIGOS (COM BUSCA FUNCIONAL)
// ============================================================

function initArticlesPage() {
    // 1. Verificação de Segurança
    if (typeof ARQUEOLOGIA_DATA === 'undefined') return;

    const grid = document.getElementById('articles-grid');
    const searchInput = document.querySelector('.search-box-wrapper input'); // Pega o campo de busca

    // 2. Função Auxiliar: Escolher ícone (Mantida)
    const getIcon = (tag) => {
        const t = tag.toLowerCase();
        if(t.includes('tecnologia') || t.includes('tech') || t.includes('blockchain')) return 'fa-microchip';
        if(t.includes('arqueologia') || t.includes('archaeology')) return 'fa-brush';
        if(t.includes('ciência') || t.includes('science')) return 'fa-atom';
        return 'fa-scroll'; 
    };

    // 3. Função de Renderização (Reutilizável)
    // Ela recebe uma lista (list) e desenha na tela.
    const renderList = (list) => {
        if(!grid) return;
        
        if(list.length === 0) {
            grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px;">Nenhum artigo encontrado para sua busca.</p>`;
            return;
        }

        grid.innerHTML = list.map(a => `
            <article class="article-card">
                <div class="card-header-row">
                    <div class="topic-icon">
                        <i class="fa-solid ${getIcon(a.tag)}"></i>
                    </div>
                    <span class="article-tag">${a.tag.split(',')[0]}</span>
                </div>

                <h3 class="article-title">${a.title}</h3>
                
                <div class="article-authors">
                    <i class="fa-regular fa-user"></i> ${a.authors.split(',')[0]} et al.
                </div>

                <button class="open-article-btn" onclick="openReader(${a.id})">
                    <i class="fa-solid fa-book-reader"></i> Acessar Estudo
                </button>
            </article>`).join('');
    };

    // 4. Renderização Inicial (Mostra tudo ao carregar)
    renderList(ARQUEOLOGIA_DATA.articles);

    // 5. LÓGICA DE FILTRAGEM (O CÉREBRO DA BUSCA)
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase(); // O que foi digitado

            // Filtra o banco de dados
            const artigosFiltrados = ARQUEOLOGIA_DATA.articles.filter(artigo => {
                const titulo = artigo.title.toLowerCase();
                const autor = artigo.authors.toLowerCase();
                const tags = artigo.tag.toLowerCase();

                // Retorna verdadeiro se o termo estiver em qualquer um desses campos
                return titulo.includes(termo) || autor.includes(termo) || tags.includes(termo);
            });

            // Atualiza a tela com a lista filtrada
            renderList(artigosFiltrados);
        });
    }

    // (Lógica do Modal continua a mesma...)
    const modal = document.getElementById('reader-modal');
    if(modal) {
        document.getElementById('close-modal').addEventListener('click', () => {
            modal.classList.add('hidden');
            setTimeout(() => modal.style.display = 'none', 300);
        });
        
        document.addEventListener('click', e => {
            if(e.target.closest('#btn-simplify')) simulateProcessing('simplify');
            if(e.target.closest('#btn-translate')) simulateProcessing('translate');
        });
    }
}

let currentArticle = null;

function openReader(id) {
    if (typeof ARQUEOLOGIA_DATA === 'undefined') return;

    currentArticle = ARQUEOLOGIA_DATA.articles.find(a => a.id === id);
    if (!currentArticle) return;

    const modal = document.getElementById('reader-modal');
    document.getElementById('modal-title').innerText = currentArticle.title;
    document.getElementById('modal-author').innerText = currentArticle.authors;
    document.getElementById('modal-tag').innerText = currentArticle.tag;
    
    // O texto vem de dados.js preservando quebras de linha
    document.getElementById('original-text').innerText = currentArticle.abstract;
    
    // Atualiza link do PDF
    const extLink = document.getElementById('external-link');
    if(extLink) {
        extLink.href = currentArticle.link || "#";
    }

    // Reseta IA
    const resultBox = document.getElementById('ai-result');
    resultBox.innerHTML = "Selecione uma opção ao lado para processar o texto.";
    resultBox.classList.add('ai-placeholder'); // Centraliza msg inicial
    
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.remove('hidden'), 10);
}

function simulateProcessing(type) {
    const resultBox = document.getElementById('ai-result');
    resultBox.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processando...';
    
    // CORREÇÃO: Remove centralização para que texto longo comece do topo
    resultBox.classList.remove('ai-placeholder');
    
    setTimeout(() => {
        let finalText = type === 'simplify' ? currentArticle.simplified : currentArticle.translated;
        
        resultBox.innerHTML = "";
        resultBox.style.opacity = 0;
        // CORREÇÃO: innerText respeita as quebras de linha do template literal
        resultBox.innerText = finalText; 
        
        // Garante scroll no topo
        resultBox.scrollTop = 0;

        let op = 0;
        let timer = setInterval(() => { if (op >= 1) clearInterval(timer); resultBox.style.opacity = op; op += 0.1; }, 50);
    }, 1000);
}

// ============================================================
// MAPA 3D E NAVEGAÇÃO
// ============================================================
const LOCATIONS_DB = {
    'salvador': { rotX: 0.22, rotY: -0.85, zoom: 6.5, title: "Salvador, Bahia", coords: "12.97° S, 38.50° W" },
    'brasil': { rotX: 0.25, rotY: -0.9, zoom: 11.0, title: "Brasil", coords: "América do Sul" },
    'bahia': { rotX: 0.22, rotY: -0.85, zoom: 8.0, title: "Bahia, Brasil", coords: "Nordeste" },
    'nova york': { rotX: -0.71, rotY: -1.29, zoom: 6.5, title: "Nova York, EUA", coords: "40.71° N, 74.00° W" },
    'paris': { rotX: -0.85, rotY: 0.04, zoom: 6.5, title: "Paris, França", coords: "48.85° N, 2.35° E" },
    'londres': { rotX: -0.89, rotY: 0.00, zoom: 6.5, title: "Londres, UK", coords: "51.50° N, 0.12° W" },
    'lisboa': { rotX: -0.67, rotY: -0.16, zoom: 6.5, title: "Lisboa, Portugal", coords: "38.72° N, 9.14° W" },
    'pequim': { rotX: -0.69, rotY: 2.02, zoom: 6.5, title: "Pequim, China", coords: "39.90° N, 116.40° E" },
    'cairo': { rotX: -0.52, rotY: 0.55, zoom: 6.5, title: "Cairo, Egito", coords: "30.04° N, 31.23° E" }
};

let targetRotationX = 0;
let targetRotationY = 0;
let targetZoom = 25; 
let isNavigating = false; 

function flyToLocation(query) {
    const key = Object.keys(LOCATIONS_DB).find(k => k.includes(query));
    if (key) {
        const dest = LOCATIONS_DB[key];
        targetRotationX = dest.rotX;
        targetRotationY = dest.rotY;
        targetCameraZ = dest.zoom;
        const hud = document.getElementById('location-info');
        if(hud) {
            hud.classList.remove('visible'); 
            setTimeout(() => {
                const titleEl = document.querySelector('#location-info h2');
                if(titleEl) titleEl.innerText = dest.title;
                const pEl = document.querySelector('#location-info p');
                if(pEl) pEl.innerText = `Coordenadas: ${dest.coords}`;
                hud.classList.add('visible');
            }, 500);
        }
        isNavigating = true;
    } else {
        alert("Local não encontrado. Tente: Salvador, Brasil, Lisboa, Paris, Pequim.");
    }
}

window.startMapAnimation = function() {
    flyToLocation('salvador');
};

let camera, scene, renderer, earth;
let bordersCountriesGroup, bordersBrazilGroup, bordersSalvadorGroup;
let salvadorMarker;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

function init3DMap() {
    const container = document.getElementById('canvas-container');
    if (!container) return; 
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 25; 

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Controles
    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    dom.addEventListener('mousemove', onPointerMove);
    dom.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('wheel', onMouseWheel); 
    dom.addEventListener('touchstart', onPointerDown);
    dom.addEventListener('touchmove', onPointerMove);
    dom.addEventListener('touchend', onPointerUp);

    // Luz
    const ambientLight = new THREE.AmbientLight(0x404040, 2.5); 
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Globo
    const geometry = new THREE.SphereGeometry(5, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
    const material = new THREE.MeshPhongMaterial({ map: earthTexture, bumpScale: 0.02, specular: new THREE.Color(0x111111), shininess: 5 });
    if(!earthTexture) material.color = new THREE.Color(0x2233ff);
    earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // Fronteiras
    bordersCountriesGroup = new THREE.Group();
    bordersBrazilGroup = new THREE.Group();
    bordersSalvadorGroup = new THREE.Group();
    earth.add(bordersCountriesGroup);
    earth.add(bordersBrazilGroup);
    earth.add(bordersSalvadorGroup);

    loadGeoJsonLines('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json', bordersCountriesGroup, 0xffffff, () => true);
    loadGeoJsonLines('https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson', bordersBrazilGroup, 0xffffff, () => true);
    drawSalvadorBorder(bordersSalvadorGroup);

    // Marcador
    const markerGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xff3333 });
    salvadorMarker = new THREE.Mesh(markerGeo, markerMat);
    salvadorMarker.visible = false;
    earth.add(salvadorMarker);
    salvadorMarker.position.set(4.0, -1.1, 2.8); 

    // Estrelas
    const starGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(1500 * 3);
    for(let i=0; i < 1500 * 3; i++) posArray[i] = (Math.random() - 0.5) * 150;
    starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starMat = new THREE.PointsMaterial({size: 0.1, color: 0xffffff, transparent: true, opacity: 0.8});
    scene.add(new THREE.Points(starGeo, starMat));

    animate();
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function loadGeoJsonLines(url, group, color, filterFn) {
    fetch(url).then(res => res.json()).then(data => {
        data.features.forEach(feature => {
            if (filterFn && !filterFn(feature)) return;
            const geo = feature.geometry;
            if (geo.type === 'Polygon') drawBorderLoop(geo.coordinates[0], group, color);
            else if (geo.type === 'MultiPolygon') geo.coordinates.forEach(poly => drawBorderLoop(poly[0], group, color));
        });
    });
}

function drawBorderLoop(coords, group, colorHex) {
    const points = [];
    const radius = 5.02;
    const step = coords.length > 500 ? 3 : 1; 
    for (let i = 0; i < coords.length; i += step) {
        const lon = coords[i][0];
        const lat = coords[i][1];
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        points.push(new THREE.Vector3(-(radius * Math.sin(phi) * Math.cos(theta)), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta)));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: colorHex, transparent: true, opacity: 0 })));
}

function drawSalvadorBorder(group) {
    const salvadorCoords = [[-38.53, -13.01], [-38.51, -13.02], [-38.48, -12.98], [-38.46, -12.94], [-38.45, -12.90], [-38.48, -12.88], [-38.52, -12.85], [-38.55, -12.82], [-38.58, -12.85], [-38.60, -12.90], [-38.58, -12.95], [-38.55, -12.98], [-38.53, -13.01]];
    drawBorderLoop(salvadorCoords, group, 0xffffff); 
}

function onPointerDown(e) { isDragging = true; isNavigating = false; previousMousePosition = { x: e.touches ? e.touches[0].clientX : e.clientX, y: e.touches ? e.touches[0].clientY : e.clientY }; }
function onPointerUp() { isDragging = false; }
function onPointerMove(e) {
    if (isDragging && earth) {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        earth.rotation.y += (clientX - previousMousePosition.x) * 0.005;
        earth.rotation.x += (clientY - previousMousePosition.y) * 0.005;
        previousMousePosition = { x: clientX, y: clientY };
    }
}
function onMouseWheel(e) { 
    e.preventDefault(); 
    isNavigating = false; 
    if (!targetZoom) targetZoom = camera.position.z;
    targetZoom += e.deltaY * 0.01; 
    targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom)); 
}

function updateMapLayers() {
    if (!camera) return;
    const dist = camera.position.z;
    const setOpacity = (grp, op) => grp && grp.children.forEach(c => { c.material.opacity = op; c.visible = op > 0.01; });

    let worldOp = (dist > 10) ? 1 : (dist - 5) / 5;
    setOpacity(bordersCountriesGroup, Math.max(0, Math.min(1, worldOp)));

    let brOpacity = (dist > 7 && dist < 12) ? 1 : 0;
    if(dist >= 12 && dist < 15) brOpacity = (15 - dist)/3;
    if(dist <= 7 && dist > 5) brOpacity = (dist - 5)/2;
    setOpacity(bordersBrazilGroup, Math.max(0, Math.min(1, brOpacity)));

    let ssaOpacity = (dist < 7.5) ? 1 : 0;
    setOpacity(bordersSalvadorGroup, Math.max(0, Math.min(1, ssaOpacity)));

    if (dist < 7.0 && Math.abs(earth.rotation.y - LOCATIONS_DB['salvador'].rotY) < 0.5) {
        salvadorMarker.visible = true;
    } else {
        salvadorMarker.visible = false;
    }
}

function animate() {
    requestAnimationFrame(animate);
    if (!isNavigating && !isDragging && earth && camera.position.z > 20) earth.rotation.y += 0.0005;
    if (isNavigating && earth) {
        earth.rotation.x = THREE.MathUtils.lerp(earth.rotation.x, targetRotationX, 0.05);
        earth.rotation.y = THREE.MathUtils.lerp(earth.rotation.y, targetRotationY, 0.05);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCameraZ, 0.05);
        if (Math.abs(camera.position.z - targetCameraZ) < 0.05 && Math.abs(earth.rotation.y - targetRotationY) < 0.01) isNavigating = false;
    } else if (!isNavigating && Math.abs(camera.position.z - targetZoom) > 0.01) {
        camera.position.z += (targetZoom - camera.position.z) * 0.05;
    }
    updateMapLayers();
    if (renderer && scene && camera) renderer.render(scene, camera);
}

function setupFeedbackForm(form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btnText = document.getElementById('btn-text');
        const successMsg = document.getElementById('success-message');
        const submitBtn = document.querySelector('.submit-btn');
        const GOOGLE_SCRIPT_URL = 'COLE_SUA_URL_DO_GOOGLE_APPS_SCRIPT_AQUI';
        const ratingInput = document.querySelector('input[name="rating"]:checked');
        const ratingValue = ratingInput ? `${ratingInput.value} ★` : "Não avaliado";
        const formData = new FormData();
        formData.append('nome', document.getElementById('name').value);
        formData.append('avaliacao', ratingValue);
        formData.append('mensagem', document.getElementById('message').value);
        formData.append('data', new Date().toLocaleString());
        btnText.innerText = "Enviando...";
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.7";
        const handleSuccess = () => { form.style.display = 'none'; successMsg.classList.remove('hidden'); };
        if (GOOGLE_SCRIPT_URL.includes('COLE_SUA_URL') || GOOGLE_SCRIPT_URL === '') { setTimeout(handleSuccess, 1500); } 
        else { fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: formData }).then(handleSuccess).catch(err => { alert("Erro ao conectar."); btnText.innerText = "Tentar Novamente"; submitBtn.disabled = false; }); }
    });
}
// ============================================================
// LÓGICA DA INTERFACE DO MAPA (HUD)
// ============================================================

// 1. Atualizar Coordenadas na Tela (Simulação)
function updateTelemetry(lat, lon, name) {
    const latEl = document.getElementById('lat-display');
    const lonEl = document.getElementById('lon-display');
    const targetEl = document.getElementById('target-display');
    
    if(latEl) latEl.innerText = lat;
    if(lonEl) lonEl.innerText = lon;
    if(targetEl) targetEl.innerText = name ? name.toUpperCase() : "ESCANEMANETO LIVRE";
}

// 2. Abrir Painel de Sítio
function showSitePanel(name, coords, desc) {
    const panel = document.getElementById('site-card');
    if(!panel) return;
    
    document.getElementById('panel-title').innerText = name;
    document.getElementById('panel-coords').innerText = `COORDS: ${coords}`;
    document.getElementById('panel-desc').innerText = desc || "Dados arqueológicos detectados. Inicie o escaneamento para mais detalhes.";
    
    panel.classList.remove('hidden');
    updateTelemetry(coords.split(',')[0], coords.split(',')[1], name);
}

function closePanel() {
    const panel = document.getElementById('site-card');
    if(panel) panel.classList.add('hidden');
    updateTelemetry('--.----°', '--.----°', null);
}

// 3. Controles de Zoom (Conectados ao Three.js)
let zoomLevel = 25; // Sincronizado com o valor inicial da câmera
const minZoom = 6;
const maxZoom = 40;

function zoomIn() {
    zoomLevel = Math.max(minZoom, zoomLevel - 5);
    // Atualiza a variável targetZoom do Three.js (assumindo que ela é global no seu script)
    if (typeof targetZoom !== 'undefined') targetZoom = zoomLevel; 
}

function zoomOut() {
    zoomLevel = Math.min(maxZoom, zoomLevel + 5);
    if (typeof targetZoom !== 'undefined') targetZoom = zoomLevel;
}

function resetView() {
    zoomLevel = 25;
    if (typeof targetZoom !== 'undefined') targetZoom = 25;
    // Reseta rotação se tiver as variáveis globais
    if (typeof targetRotationX !== 'undefined') targetRotationX = 0;
    if (typeof targetRotationY !== 'undefined') targetRotationY = 0;
    closePanel();
}

// ATUALIZAÇÃO DA FUNÇÃO flyToLocation (Para integrar com o HUD)
// (Substitua a sua função antiga por esta versão melhorada)
function flyToLocation(query) {
    const key = Object.keys(LOCATIONS_DB).find(k => k.includes(query.toLowerCase()));
    
    if (key) {
        const dest = LOCATIONS_DB[key];
        
        // Atualiza variáveis do Three.js
        targetRotationX = dest.rotX;
        targetRotationY = dest.rotY;
        targetCameraZ = dest.zoom;
        zoomLevel = dest.zoom; // Sincroniza zoom manual
        
        // Atualiza Interface (HUD)
        showSitePanel(dest.title, dest.coords);
        
        isNavigating = true;
    } else {
        alert("Local não encontrado no banco de dados.");
    }
}

