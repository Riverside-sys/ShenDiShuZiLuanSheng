import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '@/api/user.js'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    const userInfo = ref({})
    const expired = ref(false)

    const setToken = (_token) => {
      token.value = _token
    }

    const setUserInfo = (_userInfo) => {
      userInfo.value = _userInfo
    }

    const setExpired = (_expired) => {
      expired.value = _expired
    }

    const clearInfo = () => {
      token.value = undefined
      userInfo.value = undefined
    }

    const clearToken = () => {
      token.value = undefined
    }

    const logout = async () => {
      await userApi.logout()
    }

    return {
      token,
      userInfo,
      expired,
      setToken,
      setUserInfo,
      setExpired,
      clearInfo,
      clearToken,
      logout
    }
  },
  {
    persist: true
  }
)
