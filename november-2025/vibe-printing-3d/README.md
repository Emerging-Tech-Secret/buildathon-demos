# 🎨 Vibe Printing 3D

> Gerador de modelos 3D imprimíveis a partir de descrições em linguagem natural.

![Python](https://img.shields.io/badge/Python-3.9+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![React](https://img.shields.io/badge/React-18-61dafb)
![OpenSCAD](https://img.shields.io/badge/OpenSCAD-Required-orange)

## 📋 Descrição

O **Vibe Printing 3D** é um MVP que permite gerar arquivos STL para impressão 3D a partir de descrições simples em português ou inglês. O sistema interpreta palavras-chave para identificar o tipo de objeto, dimensões, estilo e atributos funcionais.

## ✨ Funcionalidades

- 🔤 **Interpretação de texto** - Extrai tipo, dimensões, estilo e atributos funcionais
- � **Modelos paramétricos** - Caixa, suporte, cilindro, bandeja e gancho
- 🎨 **Estilos** - Minimalista, robusto, futurista, orgânico
- � **Atributos funcionais** - Tampa, divisórias, furos, ganchos
- 📦 **Exportação STL** - Arquivos prontos para impressão 3D
- 👁️ **Visualização 3D** - Preview interativo com React Three Fiber

## 🏗️ Arquitetura

```
vibe-printing-3d/
├── backend/
│   ├── main.py              # API FastAPI
│   ├── parser.py            # Parser de linguagem natural
│   ├── generator.py         # Gerador OpenSCAD
│   └── templates/           # Templates SCAD
├── frontend/                # React + Vite
│   ├── src/
│   │   ├── App.jsx          # Componente principal
│   │   ├── components/      # Componentes React
│   │   │   ├── Header.jsx
│   │   │   ├── DescriptionInput.jsx
│   │   │   ├── Examples.jsx
│   │   │   ├── ObjectSpecs.jsx
│   │   │   ├── STLViewer.jsx
│   │   │   ├── ResultPanel.jsx
│   │   │   └── ErrorMessage.jsx
│   │   └── index.css        # Estilos Tailwind
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── output/                  # Arquivos STL gerados
├── requirements.txt         # Dependências Python
└── README.md
```

## 🚀 Instalação

### Pré-requisitos

1. **Python 3.9+**
2. **Node.js 18+**
3. **OpenSCAD** - [Download](https://openscad.org/downloads.html)
   - macOS: `brew install openscad` ou baixe o .dmg
   - Linux: `sudo apt install openscad`
   - Windows: Baixe o instalador

### Instalando dependências do Backend

```bash
cd vibe-printing-3d

# Crie um ambiente virtual (recomendado)
python -m venv venv
source venv/bin/activate  # Linux/macOS
# ou .\venv\Scripts\activate   # Windows

# Instale as dependências
pip install -r requirements.txt
```

### Instalando dependências do Frontend

```bash
cd frontend
npm install
```

## 🖥️ Executando

### 1. Iniciar o Backend

```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

O servidor iniciará em `http://localhost:8000`

### 2. Iniciar o Frontend (React)

```bash
cd frontend
npm run dev
```

O frontend iniciará em `http://localhost:5173`

### 3. API Docs

Acesse a documentação interativa da API em:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 📝 Exemplos de Uso

### Via Interface Web (React)

1. Inicie o frontend com `npm run dev` e acesse `http://localhost:5173`
2. Digite uma descrição, por exemplo:
   - "Uma caixa de 10x5x3 cm com tampa simples"
   - "Um suporte minimalista para celular inclinado a 30 graus"
   - "Um organizador com três divisórias retangulares"
   - "Um gancho robusto para pendurar mochila"
   - "Um porta-lápis cilíndrico, vibe futurista"
3. Clique em "Gerar STL"
4. Baixe o arquivo gerado

### Via API (curl)

```bash
# Health check
curl http://localhost:8000/health

# Gerar modelo
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"description": "Uma caixa de 10x5x3 cm com tampa"}'

# Apenas parsear (sem gerar STL)
curl -X POST http://localhost:8000/parse \
  -H "Content-Type: application/json" \
  -d '{"description": "Um gancho robusto para mochila"}'
```

### Via Python

```python
import requests

# Gerar modelo
response = requests.post(
    "http://localhost:8000/generate",
    json={"description": "Uma caixa de 10x5x3 cm com tampa"}
)
data = response.json()

# Download do STL
if data["success"] and data["download_url"]:
    stl = requests.get(f"http://localhost:8000{data['download_url']}")
    with open("minha_caixa.stl", "wb") as f:
        f.write(stl.content)
```

## 🔧 Tipos de Objetos Suportados

| Tipo | Palavras-chave | Descrição |
|------|----------------|-----------|
| **box** | caixa, box, cubo, container | Caixa retangular com opção de tampa |
| **support** | suporte, stand, apoio, holder | Suporte L para celular/tablet |
| **cylinder** | cilindro, copo, tubo, porta-lápis | Container cilíndrico |
| **tray** | bandeja, organizador, gaveta | Bandeja com divisórias opcionais |
| **hook** | gancho, cabide, pendurador | Gancho para parede |

## 🎨 Estilos Suportados

| Estilo | Palavras-chave | Efeito |
|--------|----------------|--------|
| **minimalist** | minimalista, simples, clean | Paredes mais finas |
| **robust** | robusto, forte, resistente | Paredes mais grossas |
| **futuristic** | futurista, moderno, tech | Detalhes decorativos |
| **organic** | orgânico, natural, suave | Bordas arredondadas |

## 📐 Especificando Dimensões

O parser reconhece dimensões nos formatos:
- `10x5x3 cm` - Largura x Profundidade x Altura
- `100x50x30 mm`
- `10 centímetros`

Se nenhuma dimensão for especificada, valores padrão são aplicados conforme o tipo de objeto.

## 🔨 Atributos Funcionais

| Atributo | Palavras-chave |
|----------|----------------|
| Tampa | "com tampa", "with lid" |
| Divisórias | "com divisórias", "compartimentos" |
| Furos | "com furo", "com abertura" |
| Ângulo | "inclinado a X graus", "angled at X degrees" |

## 🐛 Solução de Problemas

### OpenSCAD não encontrado

Se você receber erro de "OpenSCAD not found":

1. Verifique se o OpenSCAD está instalado
2. Adicione ao PATH ou use o caminho completo
3. No macOS, o app pode estar em `/Applications/OpenSCAD.app`

### CORS errors no frontend

Se usar um servidor HTTP diferente, verifique se a origem está permitida no CORS do backend.

### Arquivo STL não gerado

O código OpenSCAD ainda é retornado mesmo sem o STL. Você pode:
1. Instalar o OpenSCAD
2. Copiar o código SCAD e compilar manualmente

## �️ Stack Tecnológica

### Backend
- **FastAPI** - Framework web Python
- **OpenSCAD** - Geração de modelos 3D paramétricos
- **Uvicorn** - Servidor ASGI

### Frontend
- **React 19** - Biblioteca UI
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **React Three Fiber** - Visualização 3D
- **Lucide React** - Ícones

## �📄 Licença

MIT License - Projeto de hackathon para fins educacionais.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

**Vibe Printing 3D** - Transformando ideias em objetos imprimíveis 🚀
