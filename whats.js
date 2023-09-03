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
        const imageName = `${product.image}`; // Supondo que a extensão seja .jpg
        const imageUrl = `https://victor26sp.github.io/Projeto---up4/imagens/${imageName}`; // Substitua com o URL base adequado

        mensagem += `Imagem: ${imageUrl}\n\n`;
    });

    // Verifique o tipo de dispositivo (desktop ou móvel)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        // Se for um dispositivo móvel, abra o aplicativo WhatsApp com a mensagem
        const whatsappAppLink = `whatsapp://send?phone=${numeroDestinatario}&text=${encodeURIComponent(mensagem)}`;
        window.location.href = whatsappAppLink;
    } else {
        // Se for um desktop, abra o WhatsApp Web com a mensagem
        const linkWaMe = `https://web.whatsapp.com/send?phone=${numeroDestinatario}&text=${encodeURIComponent(mensagem)}`;
        window.open(linkWaMe, '_blank');
    }
}

