<template>
  <div class="container">
    <vue-toastification />
    <div class="form-group">
      <label>SPC</label>
      <select class="selectcustom" @change="setSelectedSpc">
        <option value="" hidden>Select SPC</option>
        <option v-for="item in spc" :key="item" :value="item">{{ item }}</option>
      </select>
    </div>
    <div class="form-group">
      <label>SA</label>
      <select class="selectcustom" @change="setSelectedSa">
        <option value="" hidden>Select SA</option>
        <option v-for="item in sa" :key="item" :value="item">{{ item }}</option>
      </select>
    </div>
    <div v-for="day in daysInMonthArray" :key="day" class="formgroup">
      <div> {{ day.toString().padStart(2, '0') }} {{ new Date().toLocaleString('default', { month: 'long' }) }} {{ new Date().getFullYear() }} </div>
      <div v-for="(entry, index) in entries.filter(e => e.day === day)" :key="index" class="entry-group">
        <input type="text" :value="entry.date" hidden />
        <input type="text" :value="entry.no" hidden />
        <select class="selectcustom" @change="handleStoreChange(entry.day, index, $event)">
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
      <button class="addButton" @click="addEntry(day)">+</button>
    </div>
    <button class="submitButton" @click="handleSubmit">Submit</button>
  </div>
</template>

<script>
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VUE_APP_SUPABASE_URL, process.env.VUE_APP_SUPABASE_ANON_KEY);

export default {
  data() {
    return {
      spc: [],
      sa: [],
      store: [],
      selectedSpc: '',
      selectedSa: '',
      entries: [],
      daysInMonth: 0,
    };
  },
  computed: {
    daysInMonthArray() {
      return Array.from({ length: this.daysInMonth }, (_, i) => i + 1);
    },
  },
  mounted() {
    this.fetchSpc();
    this.calculateDaysInMonth();
  },
  watch: {
    selectedSpc(newVal) {
      if (newVal) {
        this.fetchSa(newVal);
      }
    },
    selectedSa(newVal) {
      if (newVal) {
        this.fetchStore(newVal);
      }
    },
  },
  methods: {
    async fetchSpc() {
      const { data } = await supabase.from('db_spc').select('subRegionName');
      if (data) {
        this.spc = data.map(item => item.subRegionName);
      }
    },
    async fetchSa(spc) {
      const { data } = await supabase.from('db_sa').select('sub2RegionName').eq('subRegionName', spc);
      if (data) {
        this.sa = data.map(item => item.sub2RegionName);
      }
    },
    async fetchStore(sa) {
      const { data } = await supabase.from('db_consignment').select('destinationName').eq('sub2RegionName', sa);
      if (data) {
        this.store = data.map(item => item.destinationName);
      }
    },
    calculateDaysInMonth() {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const daysInMonth = new Date(year, month, 0).getDate();
      this.daysInMonth = daysInMonth;
    },
    addEntry(day) {
      const newEntry = {
        day,
        date: `${day.toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getFullYear()}`,
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
        const csvContent = 'data:text/csv;charset=utf-8,' + this.entries.map(e => Object.values(e).join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'data.csv');
        document.body.appendChild(link);
        link.click();
      }
    },
    setSelectedSpc(event) {
      this.selectedSpc = event.target.value;
    },
    setSelectedSa(event) {
      this.selectedSa = event.target.value;
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

  .selectcustom {
    
  margin-top: 5px;
    font-size: 14px;
  }

  .addButton, .removeButton {
    font-size: 14px;
  }
}

</style>
