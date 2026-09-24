Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:CurrentStage = 0
$script:TotalStages = 1 # Substitua ao definir as etapas.

function Start-Stage {
    param([Parameter(Mandatory)][string]$Name)
    $script:CurrentStage++
    Write-Host "`n[$($script:CurrentStage)/$($script:TotalStages)] $Name" -ForegroundColor Cyan
}

function Confirm-Action {
    param([Parameter(Mandatory)][string]$Prompt)
    $answer = Read-Host "$Prompt [digite SIM]"
    if ($answer -cne 'SIM') { throw 'Operação cancelada pelo usuário.' }
}

function Read-SecretValue {
    param([Parameter(Mandatory)][string]$Prompt)
    return Read-Host $Prompt -AsSecureString
}

# ETAPAS: substitua somente o bloco abaixo.
Start-Stage 'Exemplo'
Write-Host 'Substitua esta etapa pelo procedimento aprovado.'

Write-Host "`nProcedimento concluído sem exibir valores secretos." -ForegroundColor Green
