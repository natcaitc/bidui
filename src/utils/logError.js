import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_APP_SUPABASE_URL, import.meta.env.VITE_APP_SUPABASE_KEY)
const ENV = import.meta.env.MODE

function getBrowserInfo () {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
  }
}

function getComponentNameFromStack (stack = '') {
  const lines = stack.split('\n')
  const vueLine = lines.find(line => line.includes('.vue'))
  if (vueLine) {
    const match = vueLine.match(/at\s+(.*?)\s+\(/)
    return match ? match[1] : null
  }
  return null
}

// Safe dynamic imports — only work in setup context
function resolveContextSafe () {
  try {
    const { useAuthStore } = require('@/stores/auth')
    const { useRoute } = require('vue-router')

    const authStore = useAuthStore()
    const route = useRoute()

    return {
      userId: authStore?.user?.id ?? null,
      routePath: route?.path ?? null,
    }
  } catch {
    return {
      userId: null,
      routePath: null,
    }
  }
}

/**
 * Logs an error to Supabase with smart context (auto + manual)
 * @param {Error|string} error - The error to log
 * @param {object} [manualContext] - Optional overrides: userId, route, component, tag, etc.
 */
export async function logError (error, manualContext = {}) {
  const message = typeof error === 'string' ? error : error.message
  const stack = error?.stack || null
  const inferredComponent = getComponentNameFromStack(stack)

  const { userId: autoUserId, routePath } = resolveContextSafe()

  const {
    tag = null,
    userId = autoUserId,
    route = routePath,
    component = inferredComponent,
    ...extra
  } = manualContext

  const log = {
    level: 'error',
    message,
    environment: ENV,
    user_id: userId,
    route,
    component,
    tag,
    stack,
    context: {
      ...extra,
      timestamp: new Date().toISOString(),
    },
    browser: getBrowserInfo(),
  }

  if (ENV === 'development') {
    console.error(`[logError:${ENV}]`, log)
  }

  try {
    await supabase.from('logs').insert(log)
  } catch (loggingError) {
    if (ENV === 'development') {
      console.warn('Supabase logError failed:', loggingError)
    }
  }
}
