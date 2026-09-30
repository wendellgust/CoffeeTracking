# Como iniciar o projeto / How to start

Coffee & Water Tracker = frontend estático (`index.html`, `script.js`, `style.css`) + servidor Python (`server.py`) que serve os ficheiros e guarda os dados em `data/data.json`.

## Requisitos
- Python 3.6+ (só biblioteca padrão, **sem `pip install`**).
- Navegador moderno. Internet necessária para carregar Chart.js, Font Awesome e Google Fonts (CDN).

## Iniciar

```bash
cd CoffeeTracking
python3 server.py            # porta padrão 8088
python3 server.py 8085       # outra porta (argumento)
PORT=9000 python3 server.py  # outra porta (variável de ambiente)
```

Abrir no navegador: **http://localhost:8088** (ou a porta escolhida).

Parar: `Ctrl + C` no terminal.

> Não abra `index.html` diretamente (`file://`): a app precisa da API do servidor (`/api/...`).

## Aceder de outro dispositivo (telemóvel/tablet na mesma rede)
1. Descobrir o IP da máquina: `hostname -I`
2. Abrir `http://<IP>:8088`

O servidor escuta em todas as interfaces (`""`) e **não tem autenticação** — use só em rede de confiança.

## Dados
- Ficheiro: `data/data.json` (`{"coffees": [], "waters": []}`), criado automaticamente se não existir.
- Cópia de segurança automática: `data/data.json.bak` (ignorada pelo git).
- Exportar/Importar JSON pelo botão de exportação na app. Importar **substitui** todos os dados.

## Verificar que está a funcionar
```bash
curl http://localhost:8088/api/status
```
Resposta esperada: `{"status": "online", "storage": "server", "counts": {...}, ...}`

## Problemas comuns
| Sintoma | Solução |
|---|---|
| `A porta 8088 já está a ser utilizada` | Usar outra porta (`python3 server.py 8085`) ou `sudo fuser -k 8088/tcp` |
| Pílula "Offline" na app | Servidor parado/inacessível; alterações ficam só em cache local do navegador |
| Gráficos vazios / sem ícones | Sem internet (CDN) |

## Arranque automático (Raspberry Pi / systemd)
Ver secção "Guia de Instalação no Raspberry Pi" no `README.md`.

## Endpoints da API
| Método | Rota | Função |
|---|---|---|
| GET | `/api/status` | Estado + contagens |
| GET | `/api/data` | Todos os dados |
| POST | `/api/coffees`, `/api/waters` | Criar registo |
| PUT/DELETE | `/api/coffees/<id>`, `/api/waters/<id>` | Editar / apagar |
| POST | `/api/sync` | Substituir listas enviadas |
| POST | `/api/import` | Importar backup completo |
