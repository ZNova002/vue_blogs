<template>
  <Header />
  <div class="manage-contacts-container">
    <h2>Quản lý liên hệ</h2>
    <table class="contacts-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Họ tên</th>
          <th>Email</th>
          <th>Ngày gửi</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="contact in contacts" :key="contact.id">
          <td>{{ contact.id }}</td>
          <td>{{ contact.name }}</td>
          <td>{{ contact.email }}</td>
          <td>{{ formatDate(contact.created_at) }}</td>
          <td>
            <button @click="viewContact(contact.id)" class="view-btn">Xem</button>
            <button @click="handleDeleteContact(contact.id)" class="delete-btn">Xóa</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="message" :class="{ 'error': !success, 'success': success }">
      {{ message }}
    </p>

    <!-- Modal chi tiết liên hệ -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">×</span>
        <h3>Chi tiết liên hệ</h3>
        <p><strong>ID:</strong> {{ selectedContact.id }}</p>
        <p><strong>Họ tên:</strong> {{ selectedContact.name }}</p>
        <p><strong>Email:</strong> {{ selectedContact.email }}</p>
        <p><strong>Tin nhắn:</strong> {{ selectedContact.message }}</p>
        <p><strong>Ngày gửi:</strong> {{ formatDate(selectedContact.created_at) }}</p>
      </div>
    </div>
  </div>
 <Footer />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getContacts, getContact, deleteContact } from '../services/contactService';
import Header from '@/components/HeaderView.vue'
import Footer from '@/components/FooterView.vue'

const contacts = ref([]);
const selectedContact = ref(null);
const showModal = ref(false);
const message = ref('');
const success = ref(false);

const fetchContacts = async () => {
  const response = await getContacts();
  if (response.success) {
    contacts.value = response.data;
  } else {
    message.value = response.message;
    success.value = false;
  }
};

const viewContact = async (id) => {
  const response = await getContact(id);
  if (response.success) {
    selectedContact.value = response.data;
    showModal.value = true;
  } else {
    message.value = response.message;
    success.value = false;
  }
};

const handleDeleteContact = async (id) => {
  if (!confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) return;
  const response = await deleteContact(id);
  message.value = response.message;
  success.value = response.success;
  if (response.success) {
    contacts.value = contacts.value.filter((contact) => contact.id !== id);
  }
};

const closeModal = () => {
  showModal.value = false;
  selectedContact.value = null;
};

const formatDate = (date) => {
  return new Date(date).toLocaleString('vi-VN');
};

onMounted(fetchContacts);
</script>

<style scoped>
.manage-contacts-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.contacts-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th,
td {
  padding: 10px;
  border: 1px solid #ccc;
  text-align: left;
}

th {
  background-color: #f4f4f4;
}

.view-btn,
.delete-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}

.view-btn {
  background-color: #2196f3;
  color: white;
}

.view-btn:hover {
  background-color: #1e88e5;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:hover {
  background-color: #e53935;
}

.modal {
  position: fixed;
  top: 0

;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  max-width: 500px;
  width: 90%;
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 20px;
  cursor: pointer;
}

.error {
  color: red;
}

.success {
  color: green;
}
</style>
