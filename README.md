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

### 🔒 5. Servidor Centralizado & Gestão de Dados
- **Armazenamento no Servidor**: Os dados são guardados diretamente no servidor num ficheiro centralizado (`data/data.json`), com escrita atómica e cópias de segurança automáticas.
- **Sincronização Multi-dispositivo**: Acesso simultâneo através de PC, telemóvel ou tablet na rede local com sincronização automática.
- **Exportação / Importação JSON**: Permite descarregar cópias de segurança em ficheiro JSON ou restaurar registos a qualquer momento.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica, responsiva e acessível com favicon em SVG / PNG / ICO (xícara de café).
- **Vanilla CSS3**: Sistema de design em *Dark Mode*, tipografia moderna (*Outfit*, *Plus Jakarta Sans*), efeitos de glassmorphism, indicador de status do servidor e responsividade total.
- **JavaScript (ES6+)**: Comunicação assíncrona REST com o backend, gestão de estado, manipulação do DOM e lógica de estatísticas.
- **Python 3 Backend (`server.py`)**: Servidor HTTP embutido sem dependências externas (`pip`), com endpoints REST e persistência JSON segura.
- **Chart.js**: Renderização de gráficos dinâmicos de alta performance.
- **Font Awesome 6**: Ícones vetoriais.

---

## 📁 Estrutura do Projeto

```text
CoffeeTracking/
├── data/
│   └── data.json    # Base de dados centralizada no servidor (cafés e águas)
├── server.py        # Servidor backend HTTP e API REST (Python standard library)
├── index.html       # Estrutura HTML da aplicação, modais e ícone de aba
├── style.css        # Estilos CSS, temas Dark Espresso / Cyan Water e responsividade
├── script.js        # Lógica cliente, API REST assíncrona e gráficos Chart.js
├── favicon.svg      # Logo/ícone da xícara de café para a aba do navegador
├── favicon.png      # Versão rasterizada do logo (64x64)
├── favicon.ico      # Favicon multirresolução
└── README.md        # Documentação do projeto
```

---

## 💻 Como Executar Localmente

Não requer instalação de bibliotecas ou dependências externas (`pip`). Basta executar o servidor Python incluído:

```bash
# Iniciar o servidor (porta padrão 8088 ou especificar outra, ex: 8085)
python3 server.py 8085
```

Aceda a **`http://localhost:8085`** no seu navegador. Os dados registados serão automaticamente gravados em `data/data.json` no servidor.

---

## 🍓 Guia de Instalação no Raspberry Pi (Porta 8088)

Para hospedar o site no seu **Raspberry Pi** e aceder a partir de qualquer computador ou telemóvel na rede local:

### Arranque Automático com Systemd (Recomendado)

1. **Criar o serviço de sistema**:
   ```bash
   sudo nano /etc/systemd/system/coffeetracker.service
   ```

2. **Inserir a seguinte configuração**:
   ```ini
   [Unit]
   Description=Coffee and Water Tracker Server
   After=network.target

   [Service]
   Type=simple
   User=pi
   WorkingDirectory=/home/pi/CoffeeTracking
   ExecStart=/usr/bin/python3 /home/pi/CoffeeTracking/server.py 8088
   Restart=always
   RestartSec=3

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

Descubra o IP do Raspberry Pi com `hostname -I` e aceda através do navegador de qualquer dispositivo:
```text
http://<IP-DO-RASPBERRY>:8088
```

---

## 📝 Licença

Projeto desenvolvido de código aberto para acompanhamento pessoal de cafés e hidratação.
