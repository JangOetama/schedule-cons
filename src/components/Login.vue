<template>
  <div class="fluent-container">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <div class="fluent-card">
        <label class="fluent-label" for="username">Username:</label>
        <input class="fluent-input" type="text" id="username" v-model="username" required />

        <label class="fluent-label" for="password">Password:</label>
        <input class="fluent-input" type="password" id="password" v-model="password" required />

      <button class="fluent-button" type="submit">Login</button>
    </div>
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
/* Input */
.fluent-input {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 14px;
  padding: 8px 12px;
  border: 1px solid #a6a6a6;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.fluent-input:hover {
  border-color: #2b88d8;
  box-shadow: 0 0 0 1px rgba(43, 136, 216, 0.3);
}

.fluent-input:focus {
  border-color: #0078d4;
  box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.3);
}

.fluent-input:disabled {
  background-color: #f3f2f1;
  color: #a19f9d;
  cursor: not-allowed;
}

/* Button */
.fluent-button {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 14px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #0078d4;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.fluent-button:hover {
  background-color: #005a9e;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
}

.fluent-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.3);
}

.fluent-button:disabled {
  background-color: #a19f9d;
  color: #f3f2f1;
  cursor: not-allowed;
}

/* Label */
.fluent-label {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 14px;
  color: #333;
}

/* Container */
.fluent-container {
  padding: 20px;
    max-width: 600px;
    margin: 0 auto;
  border: 1px solid #a6a6a6;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Card */
.fluent-card {
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid #a6a6a6;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.fluent-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Combobox */
.combobox {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 14px;
  padding: 8px 12px;
  border: 1px solid #a6a6a6;
  border-radius: 4px;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="%23333"><path d="M4 6l4 4 4-4z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 8px center;
}

.combobox:hover {
  border-color: #2b88d8;
  box-shadow: 0 0 0 1px rgba(43, 136, 216, 0.3);
}

.combobox:focus {
  border-color: #0078d4;
  box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.3);
}

.combobox:disabled {
  background-color: #f3f2f1;
  color: #a19f9d;
  cursor: not-allowed;
}

  </style>
