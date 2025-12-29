
# Estrutura do Google Sheets - BI 360° Camaquã

Para que o dashboard funcione, crie as seguintes abas (sheets) com estas colunas exatas na primeira linha:

### 1. secretarias
- `id`
- `nome`
- `secretario`

### 2. indicadores
- `data`
- `secretaria`
- `indicador`
- `valor`
- `unidade`
- `status` (ok | atencao | critico)
- `responsavel`

### 3. prioridades_semanais
- `semana`
- `secretaria`
- `p1`
- `p2`
- `p3`
- `status`
- `justificativa`

### 4. entregas
- `id`
- `secretaria`
- `entrega`
- `status` (concluida | andamento | atrasada)
- `impacto`
- `validadoPor`

### 5. escuta_cidada
- `data`
- `tema`
- `descricao`
- `bairro`
- `status`
- `secretaria`
