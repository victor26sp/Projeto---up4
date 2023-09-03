document.getElementById('sendAllFavoritesButton').addEventListener('click', function () {
    enviarTodosOsFavoritosViaWhatsApp();
});

function enviarTodosOsFavoritosViaWhatsApp() {
    const numeroDestinatario = '+5517996282802'; // Número de telefone padrão
    let mensagem = 'Itens Favoritados:\n\n';

    const favoritos = products.filter(product => product.isFavorite);

    if (favoritos.length === 0) {
        alert("Nenhum item favoritado para enviar via WhatsApp.");
        return;
    }

    favoritos.forEach((product, index) => {
        mensagem += `Item ${index + 1}:\n`;
        mensagem += `Ref: ${product.ref}\n`;
        mensagem += `Cor: ${product.color}\n`;
        mensagem += `Categoria: ${product.category}\n`;
        mensagem += `Composição: ${product.composition}\n`;
        mensagem += `Descrição: ${product.description}\n`;

        // Use o nome do arquivo da imagem (baseado no ref) para criar a URL da imagem
        const imageName = `${product.ref}.jpg`; // Supondo que a extensão seja .jpg
        const imageUrl = `https://github.com/victor26sp/Projeto---up4/tree/5e8a37bc9b5143931b9dfb81ef8ab5a351f96f4f/imagens/${imageName}`; // Substitua com o URL base adequado

        mensagem += `Imagem: ${imageUrl}\n\n`;
    });

    const linkWaMe = `https://web.whatsapp.com/send?phone=${numeroDestinatario}&text=${encodeURIComponent(mensagem)}`;
    window.open(linkWaMe, '_blank');
}
