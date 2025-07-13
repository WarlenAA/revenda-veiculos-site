// --- FUNÇÕES DE FORMATAÇÃO ---

// Formata um valor como moeda (ex: 94.550,19)
function formatarMoeda(input) {
    let valor = input.value;

    // Remove tudo que não for dígito para ter apenas o número puro
    const digitos = valor.replace(/\D/g, '');

    // Converte para número, tratando como centavos
    const numero = Number(digitos) / 100;

    // Formata o número para o padrão brasileiro (R$)
    // e remove o símbolo da moeda, deixando apenas o número formatado.
    input.value = new Intl.NumberFormat('pt-BR', {
        // style: 'currency', // Não usamos o estilo de moeda para não mostrar o "R$"
        // currency: 'BRL',
        minimumFractionDigits: 2 // Garante que sempre terá 2 casas decimais
    }).format(numero);
}

// Formata um valor como número inteiro com pontos de milhar (ex: 120.000)
function formatarInteiro(input) {
    let valor = input.value;
    // Remove tudo que não for dígito
    valor = valor.replace(/\D/g, '');
    // Formata com o separador de milhar
    valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    input.value = valor;
}

// --- LÓGICA DO CONTADOR DE FOTOS DO CARROSSEL ---

document.addEventListener('DOMContentLoaded', () => {
    const carouselElement = document.getElementById('carouselFotos');
    
    // Se o carrossel existir na página
    if (carouselElement) {
        const carouselCounter = carouselElement.querySelector('.carousel-counter');
        const totalItems = carouselElement.querySelectorAll('.carousel-item').length;

        // Função para atualizar o contador
        const atualizarContador = () => {
            // Encontra o slide que está ativo no momento
            const itemAtivo = carouselElement.querySelector('.carousel-item.active');
            // Pega o índice (posição) do item ativo
            const indiceAtivo = Array.from(itemAtivo.parentNode.children).indexOf(itemAtivo) + 1;
            
            // Atualiza o texto do contador
            if (carouselCounter) {
                carouselCounter.textContent = `${indiceAtivo} / ${totalItems}`;
            }
        };

        // Atualiza o contador quando a página carrega
        atualizarContador();

        // Adiciona um "ouvinte" que chama a função de atualizar
        // toda vez que o carrossel termina de mudar de slide
        carouselElement.addEventListener('slid.bs.carousel', atualizarContador);
    }
});


// --- ATRIBUINDO AS FUNÇÕES AOS CAMPOS ---

// Usamos um artifício para rodar o código apenas quando a página estiver carregada
document.addEventListener('DOMContentLoaded', () => {
    const inputPreco = document.getElementById('preco');
    const inputKm = document.getElementById('quilometragem');

    if (inputPreco) {
        // Formata o valor que já existe no campo (para a página de edição)
        if(inputPreco.value) formatarMoeda(inputPreco);
        // Adiciona o evento para formatar ao digitar
        inputPreco.addEventListener('input', () => formatarMoeda(inputPreco));
    }

    if (inputKm) {
        // Formata o valor que já existe no campo (para a página de edição)
        if(inputKm.value) formatarInteiro(inputKm);
        // Adiciona o evento para formatar ao digitar
        inputKm.addEventListener('input', () => formatarInteiro(inputKm));
    }
});
