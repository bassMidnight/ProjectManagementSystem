<template>
  <div class="dashboard-grid">
    <ProjectCard
      v-for="(project, index) in projects"
      :key="index"
      :project="project"
    />
  </div>
</template>

<script>
import ProjectCard from '@/components/ProjectCard.vue'; // Adjust the path as needed

export default {
  components: {
    ProjectCard
  },
  data() {
    return {
      projects: [
        { name: 'Project Alpha', workload: 60, color: '#ffeedd' }, // Lighter tone
        { name: 'Project Beta', workload: 35, color: '#eeffdd' },
        { name: 'Project Gamma', workload: 85, color: '#eeffdd' },
        { name: 'Project Delta', workload: 45, color: '#ffeedd' },
        { name: 'Project Epsilon', workload: 20, color: '#eeffdd' },
        { name: 'Project Zeta', workload: 70, color: '#ffeedd' },
        { name: 'Project Eta', workload: 55, color: '#ffeedd' },
        { name: 'Project Theta', workload: 90, color: '#eeffdd' },
        { name: 'Project Iota', workload: 15, color: '#ffeedd' },
        { name: 'Project Kappa', workload: 80, color: '#eeffdd' },
        { name: 'Project Lambda', workload: 25, color: '#eeffdd' },
        { name: 'Project Mu', workload: 50, color: '#ffeedd' },
        { name: 'Project Nu', workload: 95, color: '#eeffdd' },
        { name: 'Project Xi', workload: 40, color: '#ffeedd' },
        { name: 'Project Omicron', workload: 30, color: '#eeffdd' },
        { name: 'Project Pi', workload: 100, color: '#eeffdd' }
      ]
    }
  }
}
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4 columns */
  grid-gap: 16px;
  padding: 20px;
}

@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr); /* Adjust to 4 columns for smaller screens */
  }
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr); /* Adjust to 2 columns for mobile */
  }
}
</style>
