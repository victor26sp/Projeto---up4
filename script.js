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

function createSizeGrid(product) {
    const sizeGridContainer = document.createElement('div');
    sizeGridContainer.classList.add('size-grid-container');

    // Adicione a classe 'table-responsive' para tornar a tabela responsiva
    const sizeGrid = document.createElement('div');
    sizeGrid.classList.add('table-responsive'); // Adicione a classe 'table-responsive'

    const table = document.createElement('table');
    table.classList.add('table', 'table-bordered', 'table-sm', 'size-grid');
    table.style.maxWidth = '100%';
    const headerRow = table.insertRow(0);
    product.sizes.forEach((size, index) => {
        const cell = headerRow.insertCell(index);
        cell.textContent = size;
        cell.classList.add('fw-bold');
    });

    const quantityRow = table.insertRow(1);
    product.sizes.forEach((size, index) => {
        const cell = quantityRow.insertCell(index);
        cell.classList.add('text-center');

        const inputGroup = document.createElement('div');
        inputGroup.classList.add('input-group', 'mb-3');

        const quantityInput = document.createElement('input');
        quantityInput.classList.add('form-control', 'text-center');
        quantityInput.type = 'number';
        quantityInput.min = 0;
        quantityInput.max = product.stock;
        quantityInput.value = '0';

        const inputGroupText = document.createElement('span');
        inputGroupText.classList.add('input-group-text');
        inputGroupText.textContent = 'Qtd';

        inputGroup.appendChild(quantityInput);
        inputGroup.appendChild(inputGroupText);
        cell.appendChild(inputGroup);
    });

    sizeGrid.appendChild(table);
    sizeGridContainer.appendChild(sizeGrid);

    return sizeGridContainer;
}



function incrementQuantity(index) {
    const quantityInput = document.querySelectorAll('.quantity-control input')[index];
    let newValue = parseInt(quantityInput.value) + 1;
    newValue = Math.min(newValue, parseInt(quantityInput.max)); // Limitar a quantidade ao estoque máximo
    quantityInput.value = newValue;
}

function decrementQuantity(index) {
    const quantityInput = document.querySelectorAll('.quantity-control input')[index];
    let newValue = parseInt(quantityInput.value) - 1;
    newValue = Math.max(newValue, 0); // Garantir que a quantidade não seja negativa
    quantityInput.value = newValue;
}
function updateQuantity(index, newValue) {
    const quantityInput = document.querySelectorAll('.quantity-control input')[index];
    quantityInput.value = newValue;
    // Atualize o produto com a nova quantidade selecionada aqui, se necessário.
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
        const sizes = product.sizes.join(', ');

        card.innerHTML = `
        <img src="imagens/${product.image}" class="card-img-top" alt="${product.description}">
        <div class="card-body">
            <h5 class="card-title">${product.description}</h5>
            <p class="card-text">Ref: ${product.ref}</p>
            <p class="card-text">Cor: ${product.color}</p>
            <p class="card-text">${product.category}</p>
            <p class="card-text">${product.composition}</p>
            <div class="sizes-section">
                <p class="card-text">Tamanhos Disponíveis: ${sizes}</p>
                <p class="size-grid">${createSizeGrid(product).outerHTML}</p>
            </div>
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
                const line = lines[i].trim();
                if (line.length === 0) {
                    break;
                }

                const [ref, description, category, color, composition, sku, stock, size, image] = line.split(';');
                const existingProduct = products.find(product => product.image === image);

                if (!existingProduct) {
                    products.push({
                        ref,
                        description,
                        category,
                        color,
                        composition,
                        image,
                        sizes: [size],
                        stock: parseInt(stock),
                        selectedQuantity: 0,
                        isFavorite: false,
                    });
                } else {
                    existingProduct.sizes.push(size);
                }
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
        alert('Nenhum item favoritado para imprimir.');
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

    const printableContent = products
        .map((product, index) => {
            currentPageItems += `
            <div class="printable-card">
                <h2 class="printable-title">${product.description}</h2>
                <p class="printable-text">Ref: ${product.ref}</p>
                <p class="printable-text">Cor: ${product.color}</p>
                <p class="printable-text">${product.category}</p>
                <p class="printable-text">${product.composition}</p>
                <div class="sizes-section">
                    <p class="printable-text">Tamanhos Disponíveis: ${product.sizes.join(', ')}</p>
                    <p class="printable-text">Quantidade Selecionada: ${product.selectedQuantity}</p>
                </div>
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
        })
        .join('');

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
                .sizes-section {
                    margin-top: 10px;
                }
                .size-grid {
                    border-collapse: collapse;
                    width: 100%;
                }
                .size-grid th,
                .size-grid td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: center;
                }
                .size-grid th {
                    background-color: #f2f2f2;
                }
                .quantity-control {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .quantity-control button {
                    background-color: #007bff;
                    color: #fff;
                    border: none;
                    padding: 5px 10px;
                    cursor: pointer;
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
