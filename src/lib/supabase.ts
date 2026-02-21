import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!')
  console.log('Verifique se o arquivo .env contém:')
  console.log('VITE_SUPABASE_URL=https://seu-projeto.supabase.co')
  console.log('VITE_SUPABASE_ANON_KEY=sua-chave-anonima')
  throw new Error('Missing Supabase environment variables')
}

// Configuração otimizada do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  },
  global: {
    headers: {
      'x-application-name': 'sbce-crm'
    }
  }
})

// Helper functions com timeout e retry
export const supabaseHelpers = {
  // Timeout wrapper para todas as operações
  async withTimeout<T>(promise: Promise<T>, timeoutMs: number = 15000): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout após ${timeoutMs}ms`)), timeoutMs)
    })
    
    return Promise.race([promise, timeoutPromise])
  },

  // Retry wrapper para operações que podem falhar
  async withRetry<T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        return await operation()
      } catch (error: any) {
        lastError = error
        console.warn(`Tentativa ${attempt} falhou:`, error.message)
        
        if (attempt <= maxRetries) {
          // Aguardar antes de tentar novamente (backoff exponencial)
          await new Promise(resolve => setTimeout(resolve, attempt * 1000))
        }
      }
    }
    
    throw lastError!
  },

  // Leads com timeout e retry
  async getLeads() {
    return this.withTimeout(
      this.withRetry(async () => {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100) // Limitar resultados para melhor performance
        
        if (error) {
          console.error('Erro ao buscar leads:', error)
          throw error
        }
        
        return data || []
      })
    )
  },

  async createLead(leadData: any) {
    return this.withTimeout(
      this.withRetry(async () => {
        const { data, error } = await supabase
          .from('leads')
          .insert(leadData)
          .select()
          .single()
        
        if (error) throw error
        return data
      })
    )
  },

  async updateLead(id: string, updates: any) {
    return this.withTimeout(
      this.withRetry(async () => {
        const { data, error } = await supabase
          .from('leads')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        
        if (error) throw error
        return data
      })
    )
  },

  async deleteLead(id: string) {
    return this.withTimeout(
      this.withRetry(async () => {
        const { error } = await supabase
          .from('leads')
          .delete()
          .eq('id', id)
        
        if (error) throw error
      })
    )
  },

  // Kanban Columns com timeout
  async getKanbanColumns() {
    return this.withTimeout(
      this.withRetry(async () => {
        const { data, error } = await supabase
          .from('kanban_columns')
          .select('*')
          .order('order_index', { ascending: true })
        
        if (error) {
          console.error('Erro ao buscar colunas:', error)
          throw error
        }
        
        return data || []
      })
    )
  },

  // Profile com timeout
  async getProfile(userId: string) {
    try {
      // Tentar buscar profile diretamente sem timeout
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, full_name, email, phone, role, instance_id, is_active, created_at, last_login, updated_at')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('Erro ao buscar profile:', error)
        
        // Se o profile não existe, tentar buscar por email primeiro
        if (error.code === 'PGRST116' || error.message?.includes('not found')) {
          console.log('Profile não encontrado por ID, tentando buscar por email...')
          
          // Buscar dados do usuário no auth
          const { data: userData } = await supabase.auth.getUser()
          
          if (userData.user && userData.user.email) {
            console.log('🔍 Buscando profile por email:', userData.user.email)
            
            // Tentar buscar profile por email
            const { data: existingProfile, error: emailError } = await supabase
              .from('profiles')
              .select('id, name, full_name, email, phone, role, instance_id, is_active, created_at, last_login, updated_at')
              .eq('email', userData.user.email)
              .single()
            
            if (existingProfile && !emailError) {
              console.log('✅ Profile encontrado por email:', existingProfile)
              return existingProfile
            } else {
              console.log('❌ Profile não encontrado por email, erro:', emailError)
            }
            
            // Se não encontrou por email, criar um novo
            console.log('Profile não encontrado por email, criando profile padrão...')
            
            // Determinar role baseado no email ou metadata
            let userRole = 'closer'
            if (userData.user.email?.includes('rafael.bastos@sbcemocional.com.br')) {
              userRole = 'super_admin'
            } else if (userData.user.email?.includes('admin') || userData.user.email?.includes('manager')) {
              userRole = 'admin'
            } else if (userData.user.email?.includes('closer')) {
              userRole = 'closer'
            } else if (userData.user.user_metadata?.role) {
              userRole = userData.user.user_metadata.role
            }
            
            const defaultProfile = {
              id: userData.user.id,
              name: userData.user.user_metadata?.full_name || userData.user.user_metadata?.name || userData.user.email?.split('@')[0] || 'Usuário',
              full_name: userData.user.user_metadata?.full_name || userData.user.user_metadata?.name || userData.user.email?.split('@')[0] || 'Usuário',
              email: userData.user.email || '',
              phone: userData.user.user_metadata?.phone || null,
              role: userRole,
              instance_id: null,
              is_active: true,
              created_at: new Date().toISOString(),
              last_login: null,
              updated_at: new Date().toISOString()
            }
            
            // Tentar inserir o profile padrão
            const { error: insertError } = await supabase
              .from('profiles')
              .insert(defaultProfile)
            
            if (insertError) {
              console.error('Erro ao criar profile padrão:', insertError)
              
              // Se é erro de duplicação, tentar buscar novamente
              if (insertError.code === '23505') {
                console.log('Profile já existe, buscando novamente...')
                const { data: retryProfile } = await supabase
                  .from('profiles')
                  .select('id, name, full_name, email, phone, role, instance_id, is_active, created_at, last_login, updated_at')
                  .eq('email', userData.user.email)
                  .single()
                
                if (retryProfile) {
                  return retryProfile
                }
              }
              
              throw insertError
            }
            
            return defaultProfile
          }
        }
        
        throw error
      }
      
      return data
    } catch (error: any) {
      console.error('Erro ao buscar profile:', error)
      throw error
    }
  },

  async updateProfile(userId: string, updates: any) {
    return this.withTimeout(
      this.withRetry(async () => {
        const { data, error } = await supabase
          .from('profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', userId)
          .select()
          .single()
        
        if (error) throw error
        return data
      })
    )
  },

  // Verificar conexão com timeout mais longo e melhor tratamento de erro
  async testConnection() {
    try {
      console.log('🔄 Testando conexão com Supabase...')
      
      // Usar uma query mais simples e rápida
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      if (error) {
        console.error('❌ Erro na query de teste:', error)
        throw error
      }
      
      console.log('✅ Conexão com Supabase estabelecida com sucesso!')
      return { success: true, message: 'Conexão OK' }
    } catch (error: any) {
      console.error('❌ Falha na conexão com Supabase:', error.message)
      return { success: false, message: error.message }
    }
  }
}

// Verificar conexão na inicialização com delay para evitar problemas de carregamento
setTimeout(() => {
  // Teste simples de conexão sem timeout
  supabase.from('profiles').select('id').limit(1).then(({ data, error }) => {
    if (error) {
      console.error('❌ Erro na conexão com Supabase:', error.message)
      console.log('💡 Verifique suas credenciais do Supabase no arquivo .env')
    } else {
      console.log('✅ Supabase conectado e pronto para uso!')
    }
  }).catch(err => {
    console.error('❌ Erro ao testar conexão:', err)
  })
}, 3000)