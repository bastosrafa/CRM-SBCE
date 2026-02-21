import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, supabaseHelpers } from '../lib/supabase'

interface Profile {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'closer'
  team?: string
  avatar_url?: string
  status: 'online' | 'busy' | 'away' | 'offline'
  leads_assigned: number
  leads_converted: number
  conversion_rate: number
  revenue: number
  calls_today: number
  meetings_scheduled: number
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, name: string, role?: string) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        console.log('Auth state changed:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const loadProfile = async (userId: string) => {
    console.log('🔍 AuthContext: loadProfile chamado para userId:', userId);
    
    // Timeout reduzido para 10 segundos
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout no carregamento do profile, usando fallback com dados reais');
      
      // Obter dados reais do usuário para o fallback
      supabase.auth.getUser().then(({ data: userData }) => {
        if (userData.user) {
          let userRole = 'closer'
          if (userData.user.email?.includes('rafael.bastos@sbcemocional.com.br')) {
            userRole = 'super_admin'
          } else if (userData.user.email?.includes('admin') || userData.user.email?.includes('manager')) {
            userRole = 'admin'
          }
          
          const fallbackProfile = {
            id: userData.user.id,
            email: userData.user.email!,
            name: userData.user.user_metadata?.name || userData.user.email!.split('@')[0],
            role: userRole as 'admin' | 'manager' | 'closer' | 'super_admin',
            status: 'offline' as const,
            leads_assigned: 0,
            leads_converted: 0,
            conversion_rate: 0,
            revenue: 0,
            calls_today: 0,
            meetings_scheduled: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          console.log('🔄 Fallback com dados reais:', fallbackProfile);
          setProfile(fallbackProfile)
          setLoading(false)
        } else {
          console.log('❌ Usuário não encontrado no fallback');
          setLoading(false)
        }
      }).catch((error) => {
        console.error('❌ Erro no fallback:', error);
        setLoading(false)
      })
    }, 10000) // 10 segundos de timeout
    
    try {
      // Buscar profile diretamente - COM TIMEOUT ESPECÍFICO
      console.log('🔍 Tentando buscar profile para userId:', userId);
      console.log('🔍 URL do Supabase:', supabase.supabaseUrl);
      
      // Timeout específico para a query do Supabase
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout após 5s')), 5000)
      )
      
      console.log('⏳ Executando query com timeout de 5s...');
      const { data: profileData, error } = await Promise.race([queryPromise, timeoutPromise]) as any
      
      console.log('📊 Resultado da busca:', { 
        profileData: profileData ? 'ENCONTRADO' : 'NULL', 
        error: error ? error.message : 'NENHUM',
        errorCode: error?.code,
        errorDetails: error?.details
      });
      
      clearTimeout(timeoutId) // Limpar timeout se sucesso
      
      if (error) {
        console.error('❌ Erro ao buscar profile:', error)
        console.error('❌ Código do erro:', error.code)
        console.error('❌ Mensagem do erro:', error.message)
        throw error
      } else {
        console.log('✅ AuthContext: Profile carregado com sucesso:', profileData);
        setProfile(profileData)
        console.log('✅ Profile definido no estado');
      }
      
      console.log('✅ Finalizando loadProfile - setLoading(false)');
      setLoading(false)
    } catch (error: any) {
      clearTimeout(timeoutId) // Limpar timeout se erro
      console.error('❌ Erro geral no loadProfile:', error)
      
      // Se é timeout da query, usar fallback imediatamente
      if (error.message?.includes('Query timeout')) {
        console.log('🚀 Query travou, usando fallback imediato com dados reais');
        
        // Obter dados reais do usuário para o fallback
        supabase.auth.getUser().then(({ data: userData }) => {
          if (userData.user) {
            let userRole = 'closer'
            if (userData.user.email?.includes('rafael.bastos@sbcemocional.com.br')) {
              userRole = 'super_admin'
            } else if (userData.user.email?.includes('admin') || userData.user.email?.includes('manager')) {
              userRole = 'admin'
            }
            
            const fallbackProfile = {
              id: userData.user.id,
              email: userData.user.email!,
              name: userData.user.user_metadata?.name || userData.user.email!.split('@')[0],
              role: userRole as 'admin' | 'manager' | 'closer' | 'super_admin',
              status: 'offline' as const,
              leads_assigned: 0,
              leads_converted: 0,
              conversion_rate: 0,
              revenue: 0,
              calls_today: 0,
              meetings_scheduled: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            console.log('✅ Fallback aplicado com dados reais:', fallbackProfile);
            setProfile(fallbackProfile)
            setLoading(false)
          } else {
            console.log('❌ Usuário não encontrado no fallback');
            setLoading(false)
          }
        }).catch((fallbackError) => {
          console.error('❌ Erro no fallback:', fallbackError);
          setLoading(false)
        })
      } else {
        // Outros erros - usar lógica existente
        try {
          const { data: userData } = await supabase.auth.getUser()
          if (userData.user) {
            let userRole = 'closer'
            if (userData.user.email?.includes('rafael.bastos@sbcemocional.com.br')) {
              userRole = 'super_admin'
            } else if (userData.user.email?.includes('admin') || userData.user.email?.includes('manager')) {
              userRole = 'admin'
            }
            
            const fallbackProfile = {
              id: userData.user.id,
              email: userData.user.email!,
              name: userData.user.user_metadata?.name || userData.user.email!.split('@')[0],
              role: userRole as 'admin' | 'manager' | 'closer' | 'super_admin',
              status: 'offline' as const,
              leads_assigned: 0,
              leads_converted: 0,
              conversion_rate: 0,
              revenue: 0,
              calls_today: 0,
              meetings_scheduled: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            console.log('🔄 Fallback com dados reais do catch:', fallbackProfile);
            setProfile(fallbackProfile)
          } else {
            throw new Error('Usuário não encontrado')
          }
        } catch (fallbackError) {
          console.error('❌ Erro no fallback:', fallbackError)
          // Último recurso - profile genérico
          setProfile({
            id: userId,
            email: 'usuario@exemplo.com',
            name: 'Usuário',
            role: 'closer' as const,
            status: 'offline' as const,
            leads_assigned: 0,
            leads_converted: 0,
            conversion_rate: 0,
            revenue: 0,
            calls_today: 0,
            meetings_scheduled: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
        
        setLoading(false)
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      console.error('Sign in error:', error)
      
      // Tratar erro específico de email não confirmado
      if (error.message?.includes('Email not confirmed')) {
        setError(new Error('Email não confirmado. Verifique sua caixa de entrada ou entre em contato com o administrador.'));
      } else {
        setError(error as Error);
      }
      
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string, role: string = 'closer') => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      })

      if (error) throw error

      // Create profile after successful signup
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          name,
          role: role as 'admin' | 'manager' | 'closer'
        })
      }

      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      // Limpar estado local primeiro
      setProfile(null)
      setUser(null)
      setSession(null)
      
      // Fazer logout do Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      }
      
      // Limpar localStorage
      localStorage.clear()
      
      // Recarregar a página para garantir limpeza completa
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
      // Mesmo com erro, limpar estado e recarregar
      setProfile(null)
      setUser(null)
      setSession(null)
      localStorage.clear()
      window.location.href = '/'
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return
    
    try {
      const updatedProfile = await supabaseHelpers.updateProfile(profile.id, updates)
      setProfile(updatedProfile)
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}