// generateFacilityTabs.js
const fs = require('fs');
const path = require('path');

const components = [
  'DetailsTab',
  'BidTimesTab',
  'WebhooksTab',
  'BidConfigurationsTab',
  'AreasTab',
];

const baseDir = path.join(__dirname, 'src', 'components', 'facility-config');

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

const template = name => `
<template>
  <v-card flat>
    <v-card-text>
      <RichTextEditor />
    </v-card-text>
  </v-card>
</template>

<script setup>
import RichTextEditor from '@/components/RichTextEditor.vue'
</script>
`.trim();

components.forEach(name => {
  const filePath = path.join(baseDir, `${name}.vue`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, template(name));
    console.log(`✅ Created ${name}.vue`);
  } else {
    console.log(`⚠️  Skipped ${name}.vue (already exists)`);
  }
});
