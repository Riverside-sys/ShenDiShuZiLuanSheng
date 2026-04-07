import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSimulationExerciseStore = defineStore('simulationExercise', () => {
  const showSimulationExercise = ref(false)

  const setShowSimulationExercise = (value) => {
    showSimulationExercise.value = value
  }

  const simulationExerciseType = ref('')

  const setSimulationExerciseType = (value) => {
    simulationExerciseType.value = value
  }
  return {
    showSimulationExercise,
    setShowSimulationExercise,
    simulationExerciseType,
    setSimulationExerciseType
  }
})
