<template>
  <Header />
  <main class="contact-page">
    <h1 class="contact-title">Contact</h1>
    <p class="contact-subtitle">Liên hệ tôi</p>

    <p class="contact-intro">
      Bạn có câu hỏi, ý tưởng hoặc chỉ muốn trò chuyện? Tôi luôn sẵn sàng lắng nghe! <br />
      Gửi email cho tôi bằng cách nhập thắc mắc bên dưới hoặc liên hệ tôi qua THÔNG TIN LIÊN HỆ ở cuối trang
    </p>

    <form class="contact-form" @submit.prevent="submitForm">
      <label>
        Name
        <input type="text" v-model="form.name" required />
      </label>

      <label>
        Email
        <input type="email" v-model="form.email" required />
      </label>

      <label>
        Comment
        <textarea rows="6" v-model="form.comment" required></textarea>
      </label>

      <button type="submit">Submit</button>
    </form>
  </main>
  <Footer />
</template>

<script setup>
import { reactive } from 'vue';
import Header from '../components/HeaderView.vue';
import Footer from '../components/FooterView.vue';
import { sendContactForm } from '../services/contactService';

const form = reactive({
  name: '',
  email: '',
  comment: ''
});

async function submitForm() {
  try {
    const res = await sendContactForm(form);
    alert(res.message);
    // Reset form
    form.name = '';
    form.email = '';
    form.comment = '';
  } catch (err) {
    console.error(err);
    alert('Gửi thất bại. Vui lòng thử lại.');
  }
}
</script>

<style scoped>
.contact-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
  color: #333;
  text-align: center;
  opacity: 0;
  animation: fadeIn 1s forwards;
}

.contact-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  transition: transform 0.3s ease;
}

.contact-title:hover {
  transform: scale(1.05);
}

.contact-subtitle {
  font-size: 14px;
  color: gray;
  margin-bottom: 30px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.contact-intro {
  margin-bottom: 30px;
  font-size: 16px;
  line-height: 1.6;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
}

.contact-form label {
  display: flex;
  flex-direction: column;
  font-size: 14px;
}

.contact-form input,
.contact-form textarea {
  resize: none;
  overflow: auto;
  margin-top: 5px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.contact-form input:focus,
.contact-form textarea:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.contact-form button {
  align-self: center;
  padding: 8px 16px;
  font-size: 14px;
  background-color: rgb(6, 11, 17);
  border: 1px solid rgb(0, 0, 0);
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.contact-form button:hover {
  background-color: #007bff;
  color: white;
  transform: scale(1.05);
}

.response-message {
  margin-top: 20px;
  padding: 10px;
  background-color: #f8f9fa;
  border: 1px solid #ccc;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>


