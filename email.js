const nodemailer = require("nodemailer");

// Função para gerar o corpo do e-mail com base nos produtos favoritados
function generateEmailBody(product) {
    const sizes = product.sizes.map(sizeObj => sizeObj.size).join(', ');

    return `
        <div>
            <h2>${product.description}</h2>
            <p>Ref: ${product.ref}</p>
            <p>Cor: ${product.color}</p>
            <p>${product.category}</p>
            <p>${product.composition}</p>
            <p>Tamanhos Disponíveis: ${sizes}</p>
            <img src="./imagens/${product.image}" alt="${product.description}">
        </div>
    `;
}

// Configurações do transporte de e-mail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "", // Será preenchido com o e-mail do remetente do formulário
        pass: "", // Será preenchido com a senha do remetente do formulário
    },
});

// Manipulador de envio de formulário
document.getElementById("emailForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Impede o envio do formulário padrão

    // Captura os dados do formulário
    const senderEmail = document.getElementById("senderEmail").value;
    const senderPassword = document.getElementById("senderPassword").value;
    const recipientList = document.getElementById("recipientList").value;
    const emailSubject = document.getElementById("emailSubject").value;
    const emailBody = document.getElementById("emailBody").value;

    // Configura as credenciais do transporte de e-mail
    transporter.options.auth.user = senderEmail;
    transporter.options.auth.pass = senderPassword;

    // Divide a lista de destinatários em um array
    const recipients = recipientList.split(",").map((email) => email.trim());

    // Loop através dos destinatários e envia e-mails para cada um
    recipients.forEach((recipient) => {
        const mailOptions = {
            from: senderEmail,
            to: recipient,
            subject: emailSubject,
            html: emailBody, // Use o corpo HTML gerado pela função
        };

        // Envia o e-mail
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.error("Erro ao enviar o e-mail:", error);
                document.getElementById("errorMessage").style.display = "block";
            } else {
                console.log("E-mail enviado com sucesso para:", recipient);
                document.getElementById("successMessage").style.display = "block";
            }
        });
    });

    // Limpa os campos do formulário
    document.getElementById("emailForm").reset();
});
