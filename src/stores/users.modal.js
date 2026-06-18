// stores/users.modal.js
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserModalStore = defineStore('UserModal', () => {
    const isUserModalVisible = ref(false)
    const isUserEditingModalVisible = ref(false)
    const editingUser = ref(null)        // ← Yangi qo'shildi

    // Yangi foydalanuvchi qo'shish uchun modal ochish
    function openUserModal() {
        editingUser.value = null           // Create rejimi
        isUserModalVisible.value = true
        console.log('Yangi xodim modal ochildi')
    }

    // Mavjud foydalanuvchini tahrirlash uchun modal ochish
    function openEditModal(user) {
        if (!user) return
        
        editingUser.value = { ...user }    // deep copy qilish yaxshiroq
        isUserEditingModalVisible.value = true
        console.log('Tahrirlash modal ochildi:', user.username)
    }
    function closeEditModal() {
        isUserEditingModalVisible.value = false
        setTimeout(() => {
            editingUser.value = null
        }, 300)
        console.log('Modal yopildi')
    }
    function closeUserModal() {
        isUserModalVisible.value = false
        // Bir oz kechikib tozalash (modal animatsiyasi tugashini kutish uchun)
        setTimeout(() => {
            editingUser.value = null
        }, 300)
        console.log('Modal yopildi')
    }

    // Qo'shimcha yordamchi funksiya
    function resetModal() {
        editingUser.value = null
    }

    return {
        isUserModalVisible,
        editingUser,
        isUserEditingModalVisible,
        openUserModal,
        openEditModal,
        closeUserModal,
        resetModal,
        closeEditModal
    }
})