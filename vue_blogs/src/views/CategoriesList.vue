<template>
  <div>
    <h1>Danh sách Categories</h1>
    <ul>
      <li v-for="category in categories" :key="category.id">
        <h3>{{ category.name }}</h3>
        <p>{{ category.description }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      categories: [],
    };
  },
  mounted() {
    this.fetchCategories();
  },
  methods: {
    fetchCategories() {
      axios
        .get('http://127.0.0.1:8000/api/categories')
        .then(response => {
          this.categories = response.data;
        })
        .catch(error => {
          console.error('Có lỗi xảy ra khi gọi API:', error);
        });
    },
  },
};
</script>

<style scoped>
h1 {
  color: #333;
}
h3 {
  color: #555;
}
p {
  color: #777;
}
</style>
