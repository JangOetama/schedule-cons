<template>
    <div class="container">
      <vue-toastification />
      <div class="form-group">
        <label>SPC : </label>
        <label class="labelcustom" v-for="item in spc" :key="item" :value="item">
          {{ item }}
        </label>
      </div>
      <div class="form-group">
        <label>SA  : </label>
        <label class="labelcustom" v-for="item in sa" :key="item" :value="item">
          {{ item }}
        </label>
      </div>
      <div v-for="day in daysInMonthArray" :key="day" class="form-group">
        <div> {{ day.toString().padStart(2, '0') }} {{ nextMonthName }} {{ nextYear }} </div>
        <div v-for="(entry, index) in entries.filter(e => e.day === day)" :key="index" class="entry-group">
          <input type="text" :value="entry.sa" hidden/>
          <input type="text" :value="entry.date" hidden />
          <input type="text" :value="entry.no" hidden />
          <select class="selectcustom" @change="handleStoreChange(entry.day, index, $event)" :disabled="entry.sa === ''">
            <option value="" hidden>Select Store</option>
            <option v-for="item in store" :key="item" :value="item">{{ item }}</option>
          </select>
          <select class="selectcustom" @change="handleScheduleChange(entry.day, index, $event)" :hidden="entry.store === ''">
            <option value="" hidden>Select Schedule</option>
            <option value="P">P</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="OFF">OFF</option>
            <option value="INV">INV</option>
          </select>
          <select class="selectcustom" @change="handleMasukChange(entry.day, index, $event)" :hidden="entry.schedule === 'OFF' || entry.store === ''">
            <option value="" hidden>Select Masuk</option>
            <option value="6:00">6:00</option>
            <option value="7:00">7:00</option>
            <option value="8:00">8:00</option>
            <option value="9:00">9:00</option>
            <option value="10:00">10:00</option>
            <option value="11:00">11:00</option>
            <option value="12:00">12:00</option>
            <option value="13:00">13:00</option>
            <option value="14:00">14:00</option>
          </select>
          <select class="selectcustom" @change="handlePulangChange(entry.day, index, $event)" :hidden="entry.schedule === 'OFF' || entry.store === ''">
            <option value="" hidden>Select Pulang</option>
            <option value="14:00">14:00</option>
            <option value="15:00">15:00</option>
            <option value="16:00">16:00</option>
            <option value="17:00">17:00</option>
            <option value="18:00">18:00</option>
            <option value="19:00">19:00</option>
            <option value="20:00">20:00</option>
            <option value="21:00">21:00</option>
            <option value="22:00">22:00</option>
          </select>
          <button class="removeButton" @click="removeEntry(day, index)">X</button>
        </div>
        <button class="addButton" @click="addEntry(day)" >+</button>
      </div>
      <button class="submitButton" @click="handleSubmit()">Submit</button>
    </div>
  </template>
  
  <script>
  /* eslint-disable */
  import { createClient } from '@supabase/supabase-js';
  
  const supabase = createClient(process.env.VUE_APP_SUPABASE_URL, process.env.VUE_APP_SUPABASE_ANON_KEY);
  
  export default {
    name: "menu-sa",
    data() {
      return {
        spc: [],
        sa: [],
        store: [],
        entries: [],
        daysInMonth: 0,
        nextMonthName: '',
        nextYear: 0,
      };
    },
    computed: {
      username() {
      return this.$store.state.username;
    },
      daysInMonthArray() {
        return Array.from({ length: this.daysInMonth }, (_, i) => i + 1);
      },
    },
    mounted() {
      this.fetchSa();
      this.calculateDaysInNextMonth();
    },

    methods: {
      async fetchSa() {
  const { data, error } = await supabase
    .from('db_sa')
    .select('sub2RegionName, subRegionName')
    .eq('sub2RegionNIK', this.username);

  if (error) {
    console.error('Error fetching data:', error);
    return;
  }

  if (data) {
    this.sa = data.map(item => item.sub2RegionName);
    this.spc = data.map(item => item.subRegionName);
  }

  await this.fetchStore(this.sa);
},
      async fetchStore(sa) {
        const { data } = await supabase.from('db_consignment').select('destinationName').eq('sub2RegionName', sa);
        if (data) {
          this.store = data.map(item => item.destinationName);
        }
      },
      calculateDaysInNextMonth() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // Bulan saat ini
        const nextMonth = month + 1; // Bulan berikutnya
        const nextYear = nextMonth > 12 ? year + 1 : year;
        const daysInMonth = new Date(nextYear, nextMonth, 0).getDate();
        this.daysInMonth = daysInMonth;
        this.nextMonthName = new Date(nextYear, nextMonth, 0).toLocaleString('default', { month: 'long' });
        this.nextYear = nextYear;
      },
      addEntry(day) {
        const newEntry = {
          day,
          sa: this.sa,
          date: `${this.nextYear}-${(new Date().getMonth() + 2).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} 00:00:00.000`,
          no: this.entries.filter(e => e.day === day).length + 1,
          store: '',
          schedule: '',
          masuk: '',
          pulang: '',
        };
        this.entries.push(newEntry);
      },
      handleScheduleChange(day, index, event) {
        const value = event.target.value;
        this.entries = this.entries.map(entry => {
          if (entry.day === day && entry.no === index + 1) {
            return { ...entry, schedule: value, masuk: value === 'OFF' ? 'OFF' : entry.masuk, pulang: value === 'OFF' ? 'OFF' : entry.pulang };
          }
          return entry;
        });
      },
      handleMasukChange(day, index, event) {
        const value = event.target.value;
        this.entries = this.entries.map(entry => {
          if (entry.day === day && entry.no === index + 1) {
            return { ...entry, masuk: value };
          }
          return entry;
        });
      },
      handlePulangChange(day, index, event) {
        const value = event.target.value;
        this.entries = this.entries.map(entry => {
          if (entry.day === day && entry.no === index + 1) {
            return { ...entry, pulang: value };
          }
          return entry;
        });
      },
      handleStoreChange(day, index, event) {
        const value = event.target.value;
        this.entries = this.entries.map(entry => {
          if (entry.day === day && entry.no === index + 1) {
            return { ...entry, store: value };
          }
          return entry;
        });
      },
      removeEntry(day, index) {
        this.entries = this.entries.filter((entry, entryIndex) => {
          return !(entry.day === day && entryIndex === index);
        });
      },
      handleSubmit() {
    const missingDays = [];
    for (let day = 1; day <= this.daysInMonth; day++) {
      if (!this.entries.some(entry => entry.day === day)) {
        missingDays.push(day);
      }
    }
  
    if (missingDays.length > 0) {
      const missingDaysMessage = `Tanggal yang masih kosong: ${missingDays.join(', ')}`;
  
      if (Notification.permission === 'granted') {
        new Notification(missingDaysMessage);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(missingDaysMessage);
          }
        });
      }
    } else {
      // Hapus tabel yang sudah ada jika ada
      const existingTable = document.querySelector('table');
      if (existingTable) {
        document.body.removeChild(existingTable);
      }
  
      // Buat tabel HTML
      const table = document.createElement('table');
      table.border = '1';
  
      // Buat header tabel
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      const headers = ['No.', 'SA', 'Date', 'Number', 'Store', 'Schedule', 'Masuk', 'Pulang'];
      headers.forEach(headerText => {
        const th = document.createElement('th');
        th.appendChild(document.createTextNode(headerText));
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
  
      // Buat body tabel
      const tbody = document.createElement('tbody');
      this.entries.forEach((e) => {
        const row = document.createElement('tr');
        Object.values(e).forEach(value => {
          const cell = document.createElement('td');
          cell.appendChild(document.createTextNode(value));
          row.appendChild(cell);
        });
        tbody.appendChild(row);
      });
      table.appendChild(tbody);
  
      // Tambahkan tabel ke halaman web
      document.body.appendChild(table);
  
      // Buat file CSV
      const csvContent = `SPC,${this.spc}\nSA,${this.sa}\n\nNo.,SA,Date,Number,Store,Schedule,Masuk,Pulang\n` +
        this.entries.map(e => Object.values(e).join(',')).join('\n');
  
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
  
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${this.sa} ${this.nextMonthName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  },
    },
  };
  /* eslint-disable */
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
  
  .submitButton {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 24px;
    background-color: #007bff; /* Warna biru Fluent UI */
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    z-index: 1000; /* Pastikan tombol di atas elemen lain */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
    font-family: 'Segoe UI'; /* Font Fluent UI */
  }
  
  .submitButton:hover {
    background-color: #0056b3; /* Warna biru lebih gelap saat hover */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  
  .submitButton:active {
    background-color: #004578; /* Warna biru lebih gelap saat aktif */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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
  