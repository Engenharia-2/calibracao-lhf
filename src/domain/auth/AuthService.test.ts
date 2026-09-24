import { describe, expect, it, vi } from 'vitest'
import type { IAuthRepository } from './IAuthRepository'
import { AuthService } from './AuthService'

const createRepository = (): IAuthRepository => ({
  login: vi.fn(),
  register: vi.fn(),
})

describe('AuthService', () => {
  it('rejeita login incompleto sem consultar o repositório', async () => {
    const repository = createRepository()
    const service = new AuthService(repository)

    await expect(service.login('', 'senha')).resolves.toEqual({
      success: false,
      error: 'E-mail e senha são obrigatórios',
    })
    expect(repository.login).not.toHaveBeenCalled()
  })

  it('delega um login válido ao repositório', async () => {
    const repository = createRepository()
    vi.mocked(repository.login).mockResolvedValue({
      success: true,
      token: 'token-de-teste',
    })
    const service = new AuthService(repository)

    await expect(service.login('operador@teste.local', 'senha')).resolves.toMatchObject({
      success: true,
    })
    expect(repository.login).toHaveBeenCalledWith('operador@teste.local', 'senha')
  })

  it('preserva a assinatura ao delegar um cadastro válido', async () => {
    const repository = createRepository()
    vi.mocked(repository.register).mockResolvedValue({ success: true })
    const service = new AuthService(repository)

    await service.register('Operador', 'operador@teste.local', 'senha', 'assinatura')

    expect(repository.register).toHaveBeenCalledWith(
      'Operador',
      'operador@teste.local',
      'senha',
      'assinatura',
    )
  })
})
