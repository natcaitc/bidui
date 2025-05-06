export default {
  'facility:access': {
    roles: ['guest', 'controller', 'bidaid', 'arearep', 'admin'],
    requiresFacility: true,
  },
  'facility:configure:edit': {
    roles: ['admin'],
    requiresFacility: true,
  },
  'facility:configure:view': {
    roles: ['arearep', 'admin'],
    requiresFacility: true,
  },
  'area:access': {
    roles: ['guest', 'controller', 'bidaid', 'arearep', 'admin'],
    requiresFacility: true,
  },
  'area:admin': {
    roles: ['arearep', 'admin'],
    requiresFacility: true,
    requiresArea: true,
  },
  'member:admin': {
    roles: ['admin'],
    requiresFacility: true,
    requiresArea: true,
  },
}
