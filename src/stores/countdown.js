// src/stores/countdown.js
import { ref, computed, watch, onUnmounted } from 'vue'
import { defineStore } from 'pinia'
import { useIntervalFn, tryOnScopeDispose, useStorage } from '@vueuse/core'
import { formatDuration, intervalToDuration, isPast, addSeconds } from 'date-fns'

export const useCountdownStore = defineStore('countdown', () => {
  /**
   * State
   */
  const isRunning = ref(false)
  const startTime = ref(null)
  const endTime = ref(null)
  const currentTime = ref(null)
  const duration = ref(0)
  const pausedAt = ref(null)
  const pausedDuration = ref(0)
  const label = ref('')
  
  // Use persistent storage for active countdowns
  const persistedCountdown = useStorage('countdown-state', {
    startTime: null,
    endTime: null,
    duration: 0,
    pausedAt: null,
    pausedDuration: 0,
    label: '',
  })
  
  // Configure timer update interval (100ms for smoother UI updates)
  const updateInterval = ref(100)
  
  // Sound notifications
  const soundEnabled = ref(true)
  const warningThreshold = ref(60) // seconds
  const notificationThresholds = ref([300, 60, 30, 10]) // 5min, 1min, 30sec, 10sec
  
  /**
   * Timer setup
   */
  const { pause: pauseTimer, resume: resumeTimer, isActive } = useIntervalFn(() => {
    if (isRunning.value) {
      updateTime()
      checkNotifications()
    }
  }, updateInterval.value, { immediate: false })
  
  // Watch for store destruction to clean up
  tryOnScopeDispose(() => {
    if (isActive.value) {
      pauseTimer()
    }
  })
  
  /**
   * Computed properties
   */
  const timeElapsed = computed(() => {
    if (!startTime.value || !currentTime.value) return 0
    
    if (pausedAt.value) {
      // Return elapsed time at pause point
      return Math.floor((pausedAt.value - startTime.value) / 1000)
    }
    
    return Math.floor((currentTime.value - startTime.value) / 1000)
  })
  
  const timeRemaining = computed(() => {
    if (pausedAt.value) {
      // Return remaining time at pause point
      const totalDuration = duration.value
      const elapsedAtPause = Math.floor((pausedAt.value - startTime.value) / 1000)
      return Math.max(0, totalDuration - elapsedAtPause)
    }
    
    if (!endTime.value || !currentTime.value) return 0
    const remaining = Math.floor((endTime.value - currentTime.value) / 1000)
    return Math.max(0, remaining)
  })
  
  const progress = computed(() => {
    if (duration.value <= 0) return 0
    const elapsed = duration.value - timeRemaining.value
    return Math.min(100, (elapsed / duration.value) * 100)
  })
  
  const isExpired = computed(() => {
    if (pausedAt.value) return false
    if (!endTime.value) return false
    
    return isPast(endTime.value)
  })
  
  const isCritical = computed(() => {
    return timeRemaining.value <= warningThreshold.value && timeRemaining.value > 0
  })
  
  const formattedTimeRemaining = computed(() => {
    const seconds = timeRemaining.value
    
    // Show milliseconds in the last 10 seconds for more precise countdown
    if (seconds < 10) {
      const totalMs = timeRemaining.value * 1000
      const ms = Math.floor(totalMs % 1000 / 10)
      const s = Math.floor(totalMs / 1000)
      return `${s}.${ms.toString().padStart(2, '0')}`
    }
    
    // Regular format for longer durations
    if (seconds < 60) {
      return `${seconds}s`
    }
    
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    
    // Format for hours
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  })
  
  const humanReadableDuration = computed(() => {
    if (!timeRemaining.value) return ''
    
    const duration = intervalToDuration({ start: 0, end: timeRemaining.value * 1000 })
    
    // Custom format to make it more readable
    const parts = []
    
    if (duration.hours) {
      parts.push(`${duration.hours}h`)
    }
    
    if (duration.minutes) {
      parts.push(`${duration.minutes}m`)
    }
    
    if (duration.seconds || (!duration.hours && !duration.minutes)) {
      parts.push(`${duration.seconds}s`)
    }
    
    return parts.join(' ')
  })
  
  /**
   * Methods
   */  
  // Update current time
  function updateTime() {
    currentTime.value = new Date()
    
    // Auto-stop if time is up
    if (isExpired.value) {
      stop({ expired: true })
    }
  }
  
  // Check for notification thresholds
  function checkNotifications() {
    if (!soundEnabled.value) return
    
    const remaining = timeRemaining.value
    if (notificationThresholds.value.includes(remaining)) {
      playNotificationSound(remaining)
    }
  }
  
  // Play notification sound based on remaining time
  function playNotificationSound(remainingTime) {
    try {
      // You could implement different sounds for different thresholds
      const audio = new Audio()
      
      // Select sound based on time remaining
      if (remainingTime <= 10) {
        audio.src = '/sounds/critical.mp3'
      } else if (remainingTime <= 60) {
        audio.src = '/sounds/warning.mp3'
      } else {
        audio.src = '/sounds/notification.mp3'
      }
      
      audio.play()
    } catch (err) {
      console.warn('Failed to play notification sound:', err)
    }
  }
  
  /**
   * Start the countdown with configuration
   */
  function start(config = {}) {
    return new Promise((resolve, reject) => {
      try {
        // Reset any existing timer
        reset()
        
        // Set up configuration
        if (config.duration && config.duration > 0) {
          // Duration-based countdown
          duration.value = Math.floor(config.duration)
          
          // Set start and end times
          startTime.value = new Date()
          endTime.value = addSeconds(startTime.value, duration.value)
        } else if (config.endTime && !isPast(new Date(config.endTime))) {
          // End-time based countdown
          endTime.value = new Date(config.endTime)
          startTime.value = new Date()
          duration.value = Math.floor((endTime.value - startTime.value) / 1000)
        } else {
          reject('Invalid configuration: provide either duration or future endTime')
          return
        }
        
        // Set optional configurations
        if (config.label) {
          label.value = config.label
        }
        
        if (config.soundEnabled !== undefined) {
          soundEnabled.value = !!config.soundEnabled
        }
        
        if (config.updateInterval && config.updateInterval > 0) {
          updateInterval.value = config.updateInterval
        }
        
        if (config.notificationThresholds) {
          notificationThresholds.value = config.notificationThresholds
        }
        
        currentTime.value = new Date()
        isRunning.value = true
        
        // Start the timer
        resumeTimer()
        
        // Persist countdown state
        saveState()
        
        resolve({
          startTime: startTime.value,
          endTime: endTime.value,
          duration: duration.value
        })
      } catch (error) {
        reject(`Failed to start countdown: ${error.message}`)
      }
    })
  }
  
  /**
   * Pause the countdown
   */
  function pause() {
    if (!isRunning.value) return false
    
    pausedAt.value = new Date()
    pausedDuration.value = timeRemaining.value
    isRunning.value = false
    pauseTimer()
    
    // Persist state
    saveState()
    
    return true
  }
  
  /**
   * Resume a paused countdown
   */
  function resume() {
    if (isRunning.value || !pausedAt.value) return false
    
    // Recalculate end time based on remaining duration
    const now = new Date()
    endTime.value = addSeconds(now, pausedDuration.value)
    
    // Clear pause state
    pausedAt.value = null
    pausedDuration.value = 0
    
    // Start the timer
    currentTime.value = now
    isRunning.value = true
    resumeTimer()
    
    // Persist state
    saveState()
    
    return true
  }
  
  /**
   * Stop the countdown
   */
  function stop(options = {}) {
    const wasRunning = isRunning.value
    isRunning.value = false
    
    if (isActive.value) {
      pauseTimer()
    }
    
    if (wasRunning && options.expired && soundEnabled.value) {
      // Play end sound if timer expired naturally
      try {
        const audio = new Audio('/sounds/timer-end.mp3')
        audio.play()
      } catch (err) {
        console.warn('Failed to play end sound:', err)
      }
    }
    
    // Clear persisted state
    clearState()
    
    return wasRunning
  }
  
  /**
   * Add time to the countdown
   */
  function addTime(seconds) {
    if (!endTime.value) return false
    
    endTime.value = addSeconds(endTime.value, seconds)
    duration.value += seconds
    
    // If paused, update the paused duration
    if (pausedAt.value) {
      pausedDuration.value += seconds
    }
    
    // Persist state
    saveState()
    
    return true
  }
  
  /**
   * Reset countdown state
   */
  function reset() {
    stop()
    
    startTime.value = null
    endTime.value = null
    currentTime.value = null
    duration.value = 0
    pausedAt.value = null
    pausedDuration.value = 0
    label.value = ''
    
    // Clear persisted state
    clearState()
  }
  
  /**
   * Save countdown state to storage
   */
  function saveState() {
    persistedCountdown.value = {
      startTime: startTime.value?.toISOString(),
      endTime: endTime.value?.toISOString(),
      duration: duration.value,
      pausedAt: pausedAt.value?.toISOString(),
      pausedDuration: pausedDuration.value,
      label: label.value,
    }
  }
  
  /**
   * Clear persisted countdown state
   */
  function clearState() {
    persistedCountdown.value = {
      startTime: null,
      endTime: null,
      duration: 0,
      pausedAt: null,
      pausedDuration: 0,
      label: '',
    }
  }
  
  /**
   * Restore countdown from persisted state
   */
  function restoreFromPersisted() {
    if (!persistedCountdown.value.endTime) return false
    
    try {
      // Parse stored dates
      const storedEndTime = new Date(persistedCountdown.value.endTime)
      const storedStartTime = new Date(persistedCountdown.value.startTime)
      
      // Check if the stored timer is still valid
      if (isPast(storedEndTime) && !persistedCountdown.value.pausedAt) {
        // Timer is expired, just clean up
        clearState()
        return false
      }
      
      // Restore state
      startTime.value = storedStartTime
      endTime.value = storedEndTime
      duration.value = persistedCountdown.value.duration
      label.value = persistedCountdown.value.label
      
      // Handle paused state
      if (persistedCountdown.value.pausedAt) {
        pausedAt.value = new Date(persistedCountdown.value.pausedAt)
        pausedDuration.value = persistedCountdown.value.pausedDuration
        currentTime.value = pausedAt.value
      } else {
        // Start running
        currentTime.value = new Date()
        isRunning.value = true
        resumeTimer()
      }
      
      return true
    } catch (err) {
      console.error('Failed to restore countdown state:', err)
      clearState()
      return false
    }
  }

  // Try to restore state when store is created
  restoreFromPersisted()
  
  return {
    // State
    isRunning,
    startTime,
    endTime,
    currentTime,
    duration,
    pausedAt,
    label,
    soundEnabled,
    warningThreshold,
    notificationThresholds,
    
    // Computed
    timeElapsed,
    timeRemaining,
    progress,
    isExpired,
    isCritical,
    formattedTimeRemaining,
    humanReadableDuration,
    
    // Actions
    start,
    pause,
    resume,
    stop,
    reset,
    addTime,
    restoreFromPersisted
  }
})