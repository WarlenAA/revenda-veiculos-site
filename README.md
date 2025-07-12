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
git commit -m "usuario padrão"
git push


Passo a Passo Para Fazer Tudo Funcionar (Do Zero)

Agora, siga esta sequência exatamente.

    Apague o Banco de Dados Antigo (para começar limpo):
    Na sua pasta do projeto, delete a pasta database ou apenas o arquivo revenda.db que está dentro dela.

    Rode o Servidor Para Criar as Tabelas:
    No terminal, execute:
    Bash

npm run dev

Você deverá ver as mensagens de "Conectado", "Tabelas verificadas" e "Servidor rodando". Isso criou o banco de dados e as tabelas carros e usuarios corretamente.

Pare o Servidor:
No terminal, pressione Ctrl + C para parar o servidor.

Adicione o Primeiro Usuário (AGORA VAI FUNCIONAR):
Agora que a tabela usuarios existe, execute o script para criar seu usuário.
Abra outro terminal na pasta
Bash

node adicionar-usuario.js warlen@gmail.com senha123

Você deverá ver a mensagem: Usuário warlen@gmail.com adicionado com sucesso!

Inicie o Servidor Novamente:
Agora, com tudo no lugar, inicie o servidor para usar o site.
Bash

    npm run dev

Pronto! Agora seu sistema está funcionando. Acesse http://localhost:3000/login, use as credenciais que você acabou de criar e o fluxo de troca de senha obrigatória será iniciado.
