<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()

// Demo record — sau này replace bằng API call theo route.params.id
const demoRecord = {
  id: String(route.params.id),
  recordType: 'trespass' as const,
  status: 'active',
  firstName: 'Jane',
  lastName: 'Smith',
  aliases: 'Jenny S, J. Smith',
  dateOfBirth: '1988-04-15',
  gender: 'female',
  physicalDescription: 'Approximately 165cm, medium build, dark brown hair, usually wears glasses.',
  summary: 'Subject issued formal trespass notice following repeated unauthorised access to South Plaza.',
  internalNotes: 'Second offence. Previously warned in Jan 2026.',
  sites: ['South Plaza', 'Central Hub'],
  threatLevel: 'medium',
  relatedIncidentIds: 'INC-2026-041, INC-2026-088',
  incidentHistorySummary: '',
  watchLevelReviewDate: '',
  associatedIndividuals: '',
  trespassNoticeNumber: 'TN-2026-0192',
  trespassIssuingAuthority: 'City Security Authority',
  propertyAreaCovered: 'South Plaza levels G-3, Central Hub main entrance',
  trespassIssueDate: '2026-04-01',
  trespassExpiryDate: '2026-07-15',
  trespassRenewalReminder: 14,
  lawEnforcementContact: 'Sgt. R. Thompson — City Police, ph: 0400 000 111',
  conditions: 'Subject is not to enter or remain on property.',
  redCardNumber: '',
  metroIssuingAuthority: '',
  metroIssueDate: '',
  metroExpiryDate: '',
  metroLines: '',
  metroRenewalReminder: 14,
  existingPhotos: [
    'https://picsum.photos/seed/ti002a/400/400',
    'https://picsum.photos/seed/ti002b/400/400',
    'https://picsum.photos/seed/ti002c/400/400',
  ],
}
</script>

<template>
  <div class="poi-edit-page">
    <POIForm mode="edit" :record="demoRecord" />
  </div>
</template>

<style scoped>
.poi-edit-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
