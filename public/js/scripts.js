// --- FUNÇÕES DE FORMATAÇÃO ---

// Formata um valor como moeda (ex: 94.550,19)
function formatarMoeda(input) {
    let valor = input.value;

    // Remove tudo que não for dígito
    valor = valor.replace(/\D/g, '');

    // Se o valor for vazio, não faz nada
    if (valor.length === 0) {
        return;
    }

    // Adiciona zeros à esquerda se necessário para ter pelo menos 3 dígitos (para os centavos)
    valor = valor.padStart(3, '0');

    // Separa os centavos do resto do número
    let inteiro = valor.slice(0, -2);
    let centavos = valor.slice(-2);

    // Formata a parte inteira com os pontos de milhar
    inteiro = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Junta tudo novamente
    input.value = `${inteiro},${centavos}`;
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
