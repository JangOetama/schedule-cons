<template>
  <div class="container">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <div class="entry-group">
        <label for="username">Username:</label>
        <input class="labelcustom" type="text" id="username" v-model="username" required />

        <label for="password">Password:</label>
        <input class="labelcustom" type="password" id="password" v-model="password" required />
      </div>
      <button class="addButton" type="submit">Login</button>
    </form>
    <p v-if="error">{{ error }}</p>
    <p v-if="success">Login successful!</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "login-account",
  data() {
    return {
      username: '',
      password: '',
      error: '',
      success: false,
    };
  },
  methods: {
    async login() {
      try {
        const response = await axios.get('/api', {
          params: {
            tipe: 'login',
            username: this.username,
            password: this.password,
          },
        });

        if (response.data === '0--0--0--0--0--0') {
          this.error = 'Login failed. Access denied.';
          this.success = false;
        } else {
          this.success = true;
          this.error = '';
          this.$store.commit('setUsername', this.username);
          this.$router.push('/menu'); 
        }
      } catch (error) {
        this.error = 'An error occurred. Please try again.';
        this.success = false;
      }
    },
  },
};
</script>

<style scoped>
  .container {
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  
  .selectcustom {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
  }
  
  .labelcustom {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
  }
  .formgroup {
    margin-bottom: 20px;
  }
  
  .entry-group {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .addButton, .removeButton {
    margin-top: 5px;
    margin-bottom: 5px;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }
  
  .addButton {
    background-color: #007bff;
    color: #fff;
  }
  
  .addButton:hover {
    background-color: #0056b3;
  }
  
  .removeButton {
    margin-bottom: 10px;
    background-color: #dc3545;
    color: #fff;
  }
  
  .removeButton:hover {
    background-color: #c82333;
  }
  
  @media (max-width: 600px) {
    .container {
      padding: 15px;
    }
  
    .labelcustom {
      margin-top: 5px;
      font-size: 14px;
    }

    .selectcustom {
      margin-top: 5px;
      font-size: 14px;
    }
  
    .addButton, .removeButton {
      font-size: 14px;
    }
  }
  
  </style>
