# Roteiro de apresentação — MadeiraFlow

Cola de apresentação: frases prontas + o que fazer na tela em cada momento. Não precisa decorar palavra por palavra — leia em voz alta 1-2 vezes antes e deixe a fala sair natural.

---

## 1. Abertura (30s) — o problema

**Fala:**
> "Marcenarias pequenas e médias, que trabalham com móveis planejados, ainda organizam os pedidos de forma manual — caderno, WhatsApp, planilha solta. Isso causa três problemas recorrentes: perda de informação de medida e material, dificuldade de saber em que fase cada móvel está, e orçamento que diverge do que foi combinado com o cliente."

**Tela:** ainda não abriu o sistema. Fala de pé, olhando pra turma/professor.

---

## 2. A solução em uma frase (15s)

**Fala:**
> "O MadeiraFlow centraliza esse processo inteiro em um sistema web: do pedido do cliente até a entrega, passando por orçamento e acompanhamento de produção."

**Tela:** agora sim, abra `index.html`.

---

## 3. Demonstração ao vivo (3–4 min) — o coração da apresentação

### 3.1 Painel

**Fala:**
> "Essa é a tela que o marceneiro vê primeiro: quantos projetos estão em andamento, quantos aguardando aprovação, quantos em produção. Embaixo, a lista dos projetos recentes."

**Ação:** aponte os 4 números e role até os cards.

### 3.2 Busca

**Fala:**
> "Se a marcenaria tem 50 projetos, ninguém quer rolar a tela toda. O usuário digita o nome do cliente e o sistema filtra na hora, sem recarregar a página."

**Ação:** digite `renata` no campo de busca. Deixe o filtro acontecer em silêncio por um segundo — o efeito visual já fala por si.

**Fala (continuando):**
> "Dá pra combinar com o status também — só projetos aprovados da Renata, por exemplo."

**Ação:** escolha um status no filtro junto com o nome.

**Fala:**
> "E se não encontrar nada, o sistema avisa, em vez de deixar a tela parecendo quebrada."

**Ação:** digite algo aleatório tipo `xyz123`.

### 3.3 Cadastro de cliente

**Fala:**
> "Vamos cadastrar um cliente novo. Se eu tentar salvar vazio..."

**Ação:** clique em "Salvar cliente" sem preencher nada.

**Fala:**
> "...o sistema não deixa passar — valida nome, telefone no formato certo, e e-mail, se preenchido."

**Ação:** preencha certo e salve.

**Fala:**
> "Pronto, ele já aparece na lista."

### 3.4 O momento mais importante: dados conectados

**Fala:**
> "Agora a parte que mostra que isso é um sistema de verdade, não só uma tela bonita: vou criar um projeto para esse cliente que acabei de cadastrar."

**Ação:** vá para "Novo projeto", abra o `<select>` de cliente.

**Fala:**
> "Repara que o cliente que acabei de cadastrar já está disponível aqui, sem eu ter feito nada a mais."

**Ação:** selecione o cliente, preencha e envie.

**Fala:**
> "Projeto criado. Agora volto para o Painel..."

**Ação:** vá para `index.html`.

**Fala:**
> "...e o projeto já está aqui. E se eu atualizar a página—"

**Ação:** aperte F5.

**Fala:**
> "—continua tudo. Os dados não eram só da tela, ficaram salvos de verdade."

*(Essa é a parte que mais impressiona — deixe ela respirar, não corra.)*

---

## 4. Por baixo do capô (1–2 min) — só o essencial

**Fala:**
> "Tecnicamente, o projeto é só front-end — HTML, CSS e JavaScript puro, sem framework e sem back-end. Os dados que acabei de mostrar persistindo ficam guardados no `localStorage` do navegador: duas listas, uma de clientes e uma de projetos, cada uma com um identificador único. Na primeira vez que o sistema abre, essas listas vêm com os dados originais; depois disso, cada cadastro novo só se soma ao que já existe — nunca apaga nada."

> "O CSS usa Flexbox para alinhar elementos em linha, como o cabeçalho e o menu, e Grid para organizar em grade, como os cards. E tem três faixas de responsividade — desktop, tablet e celular — então funciona em qualquer tamanho de tela."

**Tela:** pode deixar o DevTools aberto no Local Storage por 5 segundos, mostrando as duas chaves (`madeiraflow:clientes` e `madeiraflow:projetos`) — efeito visual rápido e forte.

---

## 5. Encerramento (15s) — próximos passos

**Fala:**
> "Hoje os dados ficam no navegador, por ser só front-end. O próximo passo natural seria um back-end real com banco de dados, para os dados serem compartilhados entre dispositivos e usuários diferentes — e autenticação, para cada marceneiro ter seu próprio acesso."

> "É isso. Alguma pergunta?"

---

## 6. Respostas rápidas para as perguntas mais prováveis

| Pergunta | Resposta em uma frase |
|---|---|
| Por que `localStorage` e não banco de dados? | "Projeto é só front-end nesta etapa; `localStorage` é a forma padrão do navegador de persistir dados sem servidor." |
| Funciona em outro computador? | "Não — `localStorage` é por navegador. Isso é esperado, dado que não há back-end ainda." |
| Por que validar no JS e não só no HTML? | "Os formulários usam `novalidate` de propósito, para as mensagens de erro customizadas sempre aparecerem, em vez das padrão do navegador." |
| Isso é seguro? | "Não totalmente — é só front-end, então dá pra burlar pelo DevTools. Numa versão com back-end, a mesma validação precisaria existir também no servidor." |
| Me explica um `filter`/`forEach`/`find` que você usou. | "`filter` eu uso na busca, pra pegar só os projetos que batem com o termo digitado. `forEach` eu uso pra desenhar cada card na tela. `find` eu uso pra achar o cliente certo quando alguém cria um projeto novo." |

---

## 7. Lembretes de postura

- Narre a **ação de negócio**, não a mecânica da tela ("o marceneiro não quer rolar 50 cards" em vez de "aqui eu digito e filtra").
- Se travar numa pergunta técnica: "boa pergunta, deixa eu checar no código" — e abra o arquivo. Isso é mais seguro do que arriscar uma resposta errada.
- Deixe o momento do F5 (seção 3.4) respirar — é o que prova que o sistema é real, não é só HTML estático.
- Fale "eu validei", "eu usei", "eu decidi" — postura de quem entende o que fez, não de quem está lendo pela primeira vez.
