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
        mensagem += `Descrição: ${product.description}\n\n`;

        // Adicione as imagens como links para as imagens hospedadas online
        mensagem += `![Imagem${index + 1}](${product.imageUrl})\n\n`; // Substitua "product.imageUrl" pelo campo que contém o URL da imagem
    });

    const linkWaMe = `https://web.whatsapp.com/send?phone=${numeroDestinatario}&text=${encodeURIComponent(mensagem)}`;
    window.open(linkWaMe, '_blank');
}
