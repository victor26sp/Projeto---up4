const catalogDiv = document.getElementById('catalog');
const cartContainer = document.getElementById('cart');
let products = [];
let categoryFilter = '';
let favoriteFilter = false;
let skuToProductMap = {}; // Mapeamento SKU para produtos
let cartItems = [];

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
    const sizeGrid = document.createElement('div');
    sizeGrid.classList.add('table-responsive');

    const table = document.createElement('table');
    table.classList.add('table', 'table-bordered', 'table-sm', 'size-grid');
    table.style.maxWidth = '100%';
    const headerRow = table.insertRow(0);

    product.sizes.forEach((sizeObj, index) => {
        const cell = headerRow.insertCell(index);
        cell.textContent = sizeObj.size;
        cell.classList.add('fw-bold');
    });

    const quantityRow = table.insertRow(1);

    product.sizes.forEach((sizeObj, index) => {
        const cell = quantityRow.insertCell(index);
        cell.classList.add('text-center');

        const inputGroup = document.createElement('div');
        inputGroup.classList.add('input-group', 'mb-3');

        const quantityInput = document.createElement('input');
        quantityInput.classList.add('form-control', 'text-center');
        quantityInput.type = 'number';
        quantityInput.min = 0;
        quantityInput.max = sizeObj.stock; // Defina o estoque máximo disponível
        quantityInput.value = '0';

        const inputGroupText = document.createElement('span');
        inputGroupText.classList.add('input-group-text');
        inputGroupText.textContent = 'Qtd';

        const quantityMessage = document.createElement('div');
        quantityMessage.classList.add('alert', 'alert-danger', 'mt-2'); // Classes de alerta Bootstrap
        quantityMessage.textContent = 'Quantidade máxima atingida.';
        quantityMessage.style.display = 'none'; // Inicialmente, oculte a mensagem de erro

        inputGroup.appendChild(quantityInput);
        inputGroup.appendChild(inputGroupText);
        cell.appendChild(inputGroup);
        cell.appendChild(quantityMessage);

        // Adicione um evento de alteração ao campo de quantidade
        quantityInput.addEventListener('change', () => {
            const selectedQuantity = parseInt(quantityInput.value);

            if (selectedQuantity > sizeObj.stock) {
                // Se a quantidade selecionada for maior que o estoque, exiba a mensagem
                quantityMessage.style.display = 'block'; // Exiba a mensagem de erro
                quantityInput.value = sizeObj.stock;
            } else {
                quantityMessage.style.display = 'none'; // Oculte a mensagem de erro
            }
        });
    });

    sizeGrid.appendChild(table);
    sizeGridContainer.appendChild(sizeGrid);

    return sizeGridContainer;
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
        const sizes = product.sizes.map(sizeObj => sizeObj.size).join(', ');
        card.innerHTML = `
        <div class="card-image" style="position: relative;">
            <img src="imagens/${product.image}" class="card-img-top" alt="${product.description}">
            <div class="video-container" id="video-container-${product.sku}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>
        </div>
    </div>
    <div class="card-body">
        <h5 class="card-title">${product.description}</h5>
        <p class="card-text">Ref: ${product.ref}</p>
        <p class="card-text">Cor: ${product.color}</p>
        <p class="card-text">${product.category}</p>
        <p class="card-text">${product.composition}</p>
        <div class="sizes-section">
            <p class="card-text">Tamanhos Disponíveis: ${sizes}</p>
        </div>
        <a href="#" class="btn ${product.isFavorite ? 'btn-danger' : 'btn-primary'} btn-sm"
            data-index="${index}" onclick="toggleFavorite(this); event.preventDefault();">
            ${product.isFavorite ? 'Desfavoritar ❤' : 'Favoritar ❤'}
        </a>
    </div>
    `;
    
        col.appendChild(card);
        catalogDiv.appendChild(col);
    
        // Adicione a funcionalidade de vídeo
        showVideo(product);
    });
    
    // Adicione event listener para botões "Adicionar ao Carrinho"
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            addToCart(button);
        });
    });
}

function importCSV(file) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n');
            products = [];
            skuToProductMap = {}; // Limpe o mapeamento

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.length === 0) {
                    break;
                }

                const [ref, description, category, color, composition, sku, stock, size, image, video] = line.split(';');
                const existingProduct = products.find(product => product.image === image);

                if (!existingProduct) {
                    const product = {
                        ref,
                        description,
                        category,
                        color,
                        composition,
                        image,
                        sizes: [], // Inicialize um array vazio de tamanhos
                        isFavorite: false,
                        sku, // Adicione o SKU ao objeto do produto
                        video, // Adicione o nome do arquivo de vídeo ao objeto do produto
                    };

                    // Adicione o produto ao mapeamento SKU
                    skuToProductMap[sku] = product;

                    // Crie um objeto de tamanho com tamanho e estoque correspondentes
                    const sizeObj = {
                        size,
                        stock: parseInt(stock),
                    };

                    // Adicione o objeto de tamanho ao array de tamanhos do produto
                    product.sizes.push(sizeObj);

                    products.push(product);
                } else {
                    // Verifique se já existe um tamanho com o mesmo nome e, se não, adicione-o
                    const existingSize = existingProduct.sizes.find(existingSize => existingSize.size === size);
                    if (!existingSize) {
                        const sizeObj = {
                            size,
                            stock: parseInt(stock),
                        };
                        existingProduct.sizes.push(sizeObj);
                    }
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

function showVideo(product) {
    if (product.video) {
        const videoContainer = document.getElementById(`video-container-${product.sku}`);
        const video = document.createElement('video');
        video.src = `videos/${product.video}`;
        video.autoplay = true; // Inicie a reprodução automaticamente
        video.loop = true; // Faça o vídeo repetir em um loop
        video.style.width = '100%'; // Define a largura do vídeo como 100% da div pai
        video.style.height = '100%'; // Define a altura do vídeo como 100% da div pai

        videoContainer.addEventListener('mouseenter', () => {
            video.play(); // Inicie o vídeo quando o mouse entrar na área
        });

        videoContainer.addEventListener('mouseleave', () => {
            video.pause(); // Pausa o vídeo quando o mouse sair da área
        });

        videoContainer.appendChild(video);
    }
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
    const itemsPerPage = 1; // Cada item em uma página A4

    const printableContent = products
        .map((product, index) => {
            const sizes = product.sizes.map(sizeObj => sizeObj.size).join(', ');

            return `
            <div class="printable-page">
                <div class="printable-card">
                    <h2 class="printable-title">${product.description}</h2>
                    <p class="printable-text">Ref: ${product.ref}</p>
                    <p class="printable-text">Cor: ${product.color}</p>
                    <p class="printable-text">${product.category}</p>
                    <p class="printable-text">${product.composition}</p>
                    <div class="sizes-section">
                        <p class="printable-text">Tamanhos Disponíveis: ${sizes}</p>
                    </div>
                    <img src="./imagens/${product.image}" class="printable-image" alt="${product.description}">
                </div>
            </div>
        `;
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
                    padding: 20px;
                    border: 1px solid #ccc;
                    margin: 20px 0;
                    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
                    page-break-inside: avoid;
                    page-break-before: always; /* Iniciar nova página para cada item */
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
                    max-width: 70%;
                    height: auto;
                    margin-top: 10px;

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

function favoritarTodos() {
    products.forEach(product => {
        product.isFavorite = true;
    });
    renderCatalog(products);
}

function desfavoritarTodos() {
    products.forEach(product => {
        product.isFavorite = false;
    });
    renderCatalog(products);
}

document.getElementById('favoritarTodos').addEventListener('click', function () {
    favoritarTodos();
});

document.getElementById('desfavoritarTodos').addEventListener('click', function () {
    desfavoritarTodos();
});

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
