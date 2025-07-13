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
