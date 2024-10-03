<template>
  <div class="card" :style="{ backgroundColor: project.color }"> <!-- Apply the background color -->
    <div class="card-content">
      <h2>{{ project.name }}</h2>
      <div class="progress-text">{{ project.workload }}% workload</div>
      <p>{{ project.description }}</p>
    </div>
    <div class="circular-progress">
      <svg width="100" height="100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#f3f3f3"
          stroke-width="10"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          stroke-width="10"
          fill="none"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="circumference - (circumference * project.workload) / 200"
          :style="{ color: getProgressColor(project.workload) }"
        />
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  computed: {
    circumference() {
      const radius = 45; // Radius of the circle
      return 2 * Math.PI * radius; // Circumference calculation
    }
  },
  methods: {
    getProgressColor(workload) {
      // Calculate color based on workload percentage
      const percentage = Math.min(workload, 200) / 200; // Normalize workload to a 0-1 range
      const r = Math.floor(255 * (1 - percentage)); // Red decreases as workload increases
      const g = Math.floor(255 * percentage); // Green increases as workload increases
      const b = 0; // Keep blue constant
      return `rgb(${g}, ${r}, ${b})`; // Return the RGB color
    }
  }
}
</script>

<style scoped>
.card {
  display: flex; /* Use flexbox for layout */
  justify-content: space-between; /* Space between content and progress */
  align-items: center; /* Center items vertically */
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  max-width: 300px;
  text-align: left; /* Align text to the left */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow effect */
  transition: box-shadow 0.3s; /* Smooth transition for shadow */
}

.card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3); /* Darker shadow on hover */
}

.card-content {
  flex-grow: 1; /* Allow content to take available space */
}

.circular-progress {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
