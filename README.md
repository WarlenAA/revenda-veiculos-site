/revenda-veiculos
|
|-- /database/
|   |-- revenda.db             (Arquivo do banco de dados, criado automaticamente)
|
|-- /public/
|   |-- /css/
|   |   |-- style.css          (Onde a mágica do visual acontece)
|   |-- /uploads/
|       |-- (As fotos dos veículos ficarão aqui)
|
|-- /routes/
|   |-- admin.js               (Lógica das rotas do painel: /admin, /admin/adicionar, etc.)
|   |-- auth.js                (Lógica das rotas de autenticação: /login, /logout, etc.)
|   |-- public.js              (Lógica das rotas públicas: página inicial, detalhes do veículo)
|
|-- /views/
|   |-- /layouts/
|   |   |-- main.hbs           (Layout principal, o "molde" de todas as páginas)
|   |-- admin.hbs              (Página que lista os veículos para o vendedor)
|   |-- admin-adicionar.hbs    (Formulário para adicionar um novo veículo)
|   |-- admin-editar.hbs       (Formulário para editar um veículo existente)
|   |-- login.hbs              (Página de login para os vendedores)
|   |-- primeiro-acesso.hbs    (Página para forçar a troca de senha)
|   |-- veiculo.hbs            (Página que mostra os detalhes de um único veículo)
|   |-- index.hbs              (Página inicial que mostra todos os veículos)
|
|-- .env                       (Arquivo para guardar dados sensíveis como senhas e segredos)
|-- .gitignore                 (Define quais arquivos e pastas não devem ir para o repositório Git)
|-- adicionar-usuario.js       (Script de terminal para você, o dono, criar novos vendedores)
|-- package.json               (Identidade do projeto, lista todas as dependências)
|-- server.js                  (O coração do projeto: inicia o servidor e conecta tudo)



git add .
git commit -m "adicionado usuario e senha no arquivo .env lado servidor"
git push


npm run dev


Adicione o Primeiro Usuário (AGORA VAI FUNCIONAR):
Agora que a tabela usuarios existe, execute o script para criar seu usuário.


node adicionar-usuario.js warlen@gmail.com senha123


Pronto! Agora seu sistema está funcionando. Acesse http://localhost:3000/login, use as credenciais que você acabou de criar e o fluxo de troca de senha obrigatória será iniciado.
