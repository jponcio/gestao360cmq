
# Estrutura do Google Sheets - BI 360° Camaquã (v1.9.0)

Crie uma planilha no Google Drive e adicione as seguintes abas com os cabeçalhos na primeira linha:

### 1. kanban_data
- `id` (ID do Card)
- `secretariaId` (Ex: S1, S2...)
- `titulo`
- `dono` (Responsável)
- `status` (Backlog, Em Andamento, Depende de, Concluído)
- `atualizadoEm` (Data ISO)
- `justificativa`
- `tipo` (Operacional, Estratégico...)

### 2. okr_data
- `id`
- `objetivo`
- `krs_json` (Texto contendo os Key Results em formato JSON)
- `archived_krs_json`
- `status_geral`

### 3. swot_data
- `id`
- `quadrante` (forcas, fraquezas, oportunidades, ameacas)
- `texto`
- `responsavel`

### 4. escuta_cidada
- `id`
- `data`
- `tema`
- `descricao`
- `bairro`
- `lat`
- `lng`
- `status`

### 5. configuracoes
- `chave`
- `valor` (Para armazenar saldo em caixa, arrecadação, etc)
