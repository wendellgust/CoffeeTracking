# ☕💧 Coffee & Water Tracker

Uma aplicação web moderna, responsiva e completa para acompanhar diariamente o consumo de café (gastos em euros, estatísticas, métodos de preparo em casa) e o consumo de água (hidratação em mililitros, litros e garrafas de 750 ml).

---

## 🌟 Funcionalidades Principais

### ☕ 1. Módulo de Café (Coffee Tracker)
- **Campos Obrigatórios**: Nome do café (autocomplete) e Preço em Euros (€).
- **Campos Opcionais**: Avaliação (0 a 5 estrelas), Lugar/Local e Data/Hora (automática, editável).
- **Acompanhantes**: Registo de consumo **Sozinho (1 pessoa)** vs **Com Acompanhantes (N pessoas)**.
- **Feito em Casa 🏠**:
  - Peso do café (g)
  - Marca / Origem do Grão
  - Moído no momento (Sim / Não + Grau de moagem)
  - Tempo de preparo (minutos)
  - Quantidade feita (ml / chávenas)
  - **Avaliação diferida**: Opção para deixar o café em estado *⭐ Pendente de Avaliação* e classificar mais tarde com 1-clique.

### 💧 2. Módulo de Água (Water Tracker)
- **Aba Dedicada**: Alternador rápido entre a vista de **Café ☕** e **Água 💧**.
- **Garrafas de 750 ml**: Suporte nativo para cálculo automático em garrafas de 750 ml, ml e Litros (L).
- **Atalhos Rápidos**:
  - 🍼 **+1 Garrafa (750 ml)**
  - 🍼 **+2 Garrafas (1.500 ml / 1,5 L)**
  - 🥛 **+1 Copo (250 ml)**
  - 💧 **+500 ml**
  - Dose personalizada com calculadora automática de garrafas.

### 📊 3. Painel de Estatísticas (Sem Gráfico)
- **Estatísticas de Café**:
  - Café preferido (maior frequência e melhor cotação)
  - Horário de pico (faixa horária de maior consumo)
  - Dia da semana favorito
  - Média de cafés por dia
  - Média de dinheiro gasto por dia (€)
  - Café mais caro (nome, local e preço em €)
  - Café mais barato (nome, local e preço em €)
  - Média de acompanhantes
  - Proporção Sozinho vs Acompanhado (quantidade e %)
- **Estatísticas de Água**:
  - Total de água consumida (em Litros e ml)
  - Total de garrafas consumidas (baseado no tamanho de 750 ml)
  - Média diária (Litros/dia e garrafas/dia)
  - Horário de pico de hidratação
  - Dia da semana com maior consumo de água

### 📈 4. Análise Gráfica Interativa (Chart.js)
- **Gráficos de Café**:
  - Métricas: *Café Consumido* vs *Preço Gasto em Euros (€)*
  - Períodos: *Dia*, *Dia da Semana*, *Mês*, *Ano*
  - Gráficos de rosca: *Feito em Casa vs Cafeterias* e *Distribuição de Avaliações (0-5★)*
- **Gráficos de Água**:
  - Métricas: *Litros (L)*, *Mililitros (ml)*, *Garrafas (750ml)*
  - Períodos: *Dia*, *Dia da Semana*, *Mês*, *Ano*

### 🔒 5. Privacidade & Gestão de Dados
- **Sem servidor externo**: Os dados são guardados localmente no navegador (`localStorage`).
- **Exportação / Importação JSON**: Permite descarregar cópias de segurança em ficheiro JSON ou migrar registos entre dispositivos.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível.
- **Vanilla CSS3**: Sistema de design em *Dark Mode*, tipografia moderna (*Outfit*, *Plus Jakarta Sans*), efeitos de glassmorphism e responsividade total.
- **JavaScript (ES6+)**: Gestão de estado local, manipulação do DOM e lógica de estatísticas.
- **Chart.js**: Renderização de gráficos dinâmicos de alta performance.
- **Font Awesome 6**: Ícones vetoriais.

---

## 📁 Estrutura do Projeto

```text
CoffeeTracking/
├── index.html       # Estrutura HTML da aplicação e modais
├── style.css        # Estilos CSS, temas Dark Espresso / Cyan Water e responsividade
├── script.js        # Lógica da aplicação, gráficos Chart.js e localStorage
└── README.md        # Documentação do projeto
```

---

## 💻 Como Executar Localmente

Não requer instalação de dependências ou build step. Basta abrir o ficheiro `index.html` em qualquer navegador web ou utilizar um servidor HTTP simples:

```bash
# Exemplo com Python 3 (na porta 8085)
python3 -m http.server 8085
```

Aceda a `http://localhost:8085` no seu navegador.

---

## 🍓 Guia de Instalação no Raspberry Pi (Porta 8088)

Para hospedar o site no seu **Raspberry Pi** e aceder no telemóvel ou PC da sua rede doméstica numa porta diferente da 8080 (ex: **`8088`**):

### Opção 1: Usando Nginx (Recomendado)

1. **Instalar o Nginx**:
   ```bash
   sudo apt update
   sudo apt install nginx -y
   ```

2. **Criar a configuração do site**:
   ```bash
   sudo nano /etc/nginx/sites-available/coffeetracker
   ```

   Cole o seguinte conteúdo:
   ```nginx
   server {
       listen 8088;
       server_name _;

       root /home/pi/coffeetracker;
       index index.html;

       location / {
           try_files $uri $uri/ =404;
       }
   }
   ```

3. **Ativar o site e reiniciar o Nginx**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/coffeetracker /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

### Opção 2: Usando Python 3 + Arranque Automático (Systemd)

1. **Criar o serviço de sistema**:
   ```bash
   sudo nano /etc/systemd/system/coffeetracker.service
   ```

2. **Inserir o conteúdo**:
   ```ini
   [Unit]
   Description=Coffee and Water Tracker HTTP Server
   After=network.target

   [Service]
   Type=simple
   User=pi
   WorkingDirectory=/home/pi/coffeetracker
   ExecStart=/usr/bin/python3 -m http.server 8088
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

3. **Ativar o serviço**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable coffeetracker
   sudo systemctl start coffeetracker
   ```

### 🌐 Acesso no Telemóvel / PC

Descubra o IP do Raspberry Pi com `hostname -I` e aceda através do seu navegador:
```text
http://<IP-DO-RASPBERRY>:8088
```

---

## 📝 Licença

Projeto desenvolvido de código aberto para acompanhamento pessoal de cafés e hidratação.
