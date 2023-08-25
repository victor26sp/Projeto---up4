const catalogDiv = document.getElementById('catalog');
let products = [];
let categoryFilter = '';
let favoriteFilter = false;

function toggleFavorite(btn) {
    btn.classList.toggle('btn-danger');
    btn.classList.toggle('btn-primary');

    const productIndex = parseInt(btn.getAttribute('data-index'));

    products[productIndex].isFavorite = !products[productIndex].isFavorite;

    renderCatalog(products);
}

function clearFavorites() {
    products.forEach(product => {
        product.isFavorite = false;
    });
    renderCatalog(products);
}

function renderCatalog(products) {
    catalogDiv.innerHTML = '';

    const filteredProducts = products.filter(product => {
        if (favoriteFilter && !product.isFavorite) {
            return false;
        }
        if (categoryFilter && product.category !== categoryFilter) {
            return false;
        }
        return true;
    });

    filteredProducts.forEach((product, index) => {
        const col = document.createElement('div');
        col.classList.add('col-md-4', 'mb-4');

        const card = document.createElement('div');
        card.classList.add('card', 'h-100');
        card.innerHTML = `
            <img src="./imagens/${product.image}" class="card-img-top" alt="${product.description}">
            <div class="card-body">
                <h5 class="card-title">${product.description}</h5>
                <p class="card-text">Ref: ${product.ref}</p>
                <p class="card-text">Cor: ${product.color}</p>
                <p class="card-text">${product.category}</p>
                <p class="card-text">${product.composition}</p>
                <a href="#" class="btn ${product.isFavorite ? 'btn-danger' : 'btn-primary'} btn-sm" 
                    data-index="${index}" onclick="toggleFavorite(this); event.preventDefault();">
                    ${product.isFavorite ? 'Desfavoritar ❤' : 'Favoritar ❤'}
                </a>
            </div>
        `;

        col.appendChild(card);
        catalogDiv.appendChild(col);
    });
}

function importCSV(file) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n');
            products = [];

            for (let i = 1; i < lines.length; i++) {
                const [ref, description, category, color, composition, image] = lines[i].split(';');
                products.push({
                    ref,
                    description,
                    category,
                    color,
                    composition,
                    image,
                    isFavorite: false
                });
            }

            renderCatalog(products);
            populateCategoryFilter();
        });
}

function populateCategoryFilter() {
    const categoryFilterSelect = document.getElementById('categoryFilter');
    const categories = Array.from(new Set(products.map(product => product.category)));
    categories.sort();

    categoryFilterSelect.innerHTML = '<option value="">Todas as Categorias</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilterSelect.appendChild(option);
    });
}

importCSV('products.csv');

function printCatalog() {
    const favoriteProducts = getFavoriteProducts();

    if (favoriteProducts.length === 0) {
        alert("Nenhum item favoritado para imprimir.");
        return;
    }

    const printableContent = generatePrintableHTML(favoriteProducts);

    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(printableContent);
    printWindow.document.close();

    printWindow.onload = function () {
        printWindow.print();
        setTimeout(function () {
            printWindow.close();
        }, 1000);
    };
}

function getFavoriteProducts() {
    const favoriteProducts = products.filter(product => product.isFavorite);
    return favoriteProducts;
}

function generatePrintableHTML(products) {
    const itemsPerPage = 4;
    let currentPageItems = '';

    const printableContent = products.map((product, index) => {
        currentPageItems += `
            <div class="printable-card">
                <h2 class="printable-title">${product.description}</h2>
                <p class="printable-text">Ref: ${product.ref}</p>
                <p class="printable-text">Cor: ${product.color}</p>
                <p class="printable-text">${product.category}</p>
                <p class="printable-text">${product.composition}</p>
                <img src="./imagens/${product.image}" class="printable-image" alt="${product.description}">
            </div>
        `;

        if ((index + 1) % itemsPerPage === 0 || index === products.length - 1) {
            const page = `
                <div class="printable-page">
                    ${currentPageItems}
                </div>
            `;
            currentPageItems = '';
            return page;
        }
        return '';
    }).join('');

    const printableHTML = `
        <html>
        <head>
            <title>Catálogo Favoritado para Impressão</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                }
                .printable-card {
                    page-break-inside: avoid;
                    padding: 20px;
                    border: 1px solid #ccc;
                    margin: 20px;
                    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
                }
                .printable-title {
                    font-size: 1.5rem;
                    margin-bottom: 10px;
                }
                .printable-text {
                    font-size: 1rem;
                    color: #555;
                }
                .printable-image {
                    max-width: 100%;
                    height: auto;
                    margin-top: 10px;
                }
                .printable-page {
                    page-break-after: always;
                    padding: 20px;
                }
            </style>
        </head>
        <body>
            ${printableContent}
        </body>
        </html>
    `;

    return printableHTML;
}

document.getElementById('printButton').addEventListener('click', printCatalog);

document.getElementById('categoryFilter').addEventListener('change', function () {
    categoryFilter = this.value;
    renderCatalog(products);
});

document.getElementById('favoriteFilterInput').addEventListener('change', function () {
    favoriteFilter = this.checked;
    renderCatalog(products);
});

document.getElementById('clearFiltersButton').addEventListener('click', function () {
    categoryFilter = '';
    favoriteFilter = false;
    renderCatalog(products);
});

document.getElementById('categoryFilterButton').addEventListener('click', function () {
    const categoryFilterContainer = document.getElementById('categoryFilterContainer');
    categoryFilterContainer.classList.toggle('d-none');
});
