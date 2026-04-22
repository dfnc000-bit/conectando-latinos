import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Cliente mock para cuando Supabase no esta configurado
function createMockClient() {
  const noOp = async () => ({ data: null, error: null })
  // chainable debe ser un objeto Y una promesa para que funcione con await
  const makeChainable = (): any => {
    const obj: any = {
      select: () => makeChainable(),
      insert: noOp,
      update: () => makeChainable(),
      delete: () => makeChainable(),
      eq: () => makeChainable(),
      neq: () => makeChainable(),
      or: () => makeChainable(),
      order: () => makeChainable(),
      limit: () => makeChainable(),
      single: async () => ({ data: null, error: { message: 'mock' } }),
      then: (resolve: any) => Promise.resolve({ data: [], error: null }).then(resolve),
    }
    return obj
  }
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Supabase no configurado' } }),
      signUp: async () => ({ data: null, error: { message: 'Supabase no configurado' } }),
    },
    from: () => makeChainable(),
  } as any
}

export async function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return createMockClient()
  }

  const cookieStore = await cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Ignorar en Server Components
        }
      },
    },
  })
}
