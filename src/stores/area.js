import { defineStore } from 'pinia';
import { AreaRepository } from '@/api/index.js';

export const useAreaStore = defineStore('area', {
  // State
  state: () => ({
    areas: null,
    area: null,
  }),

  // Getters
  getters: {
    getArea: state => state.area,
    getAreas: state => state.areas,
  },

  // Actions
  actions: {
    async fetchAreas () {
      try {
        const AREA = new AreaRepository()
        const response = await AREA.fetchAreas()
        this.areas = response.data
        return this.areas
      } catch (e) {
        console.error('Failed to retrieve areas:', e)
        throw e
      }
    },

    async updateArea (areaId, data) {
      try {
        const AREA = new AreaRepository()
        const response = await AREA.updateArea(areaId, data)

        // Update the area in the local state
        if (this.areas) {
          const index = this.areas.findIndex(a => a.id === areaId)
          if (index !== -1) {
            this.areas[index] = { ...this.areas[index], ...data }
          }
        }

        // If this is the currently selected area, update it too
        if (this.area && this.area.id === areaId) {
          this.area = { ...this.area, ...data }
        }

        return response.data
      } catch (e) {
        console.error('Failed to update area:', e)
        throw e
      }
    },

    async deleteArea (areaId) {
      try {
        const AREA = new AreaRepository()
        const response = await AREA.deleteArea(areaId)

        // Remove the area from local state without triggering a refetch
        if (this.areas) {
          this.areas = this.areas.filter(area => area.id !== areaId)
        }

        // If this is the currently selected area, clear it
        if (this.area && this.area.id === areaId) {
          this.area = null
        }

        return response.data
      } catch (e) {
        console.error('Failed to delete area:', e)
        throw e
      }
    },

    async createArea (areaData) {
      try {
        const AREA = new AreaRepository()

        // Create slug if not provided
        if (!areaData.slug) {
          areaData.slug = areaData.name.toLowerCase().replace(/\s+/g, '-')
        }

        // Ensure numeric values are sent as integers
        areaData.use_bid_aid = parseInt(areaData.use_bid_aid || 0)
        areaData.subtract_holiday_leave = parseInt(areaData.subtract_holiday_leave || 0)

        // Create area via API
        const response = await AREA.createArea(areaData)

        // Add the new area to the local state without triggering a refetch
        if (this.areas) {
          this.areas = [...this.areas, response.data]
        } else {
          this.areas = [response.data]
        }

        return response.data
      } catch (e) {
        console.error('Failed to create area:', e)
        throw e
      }
    },

    setAreas (areas) {
      this.areas = areas
    },
  },
});
