<template>
  <div class="container">
    <vue-toastification />
    <div v-if="loading" class="loading">
      <img src="path/to/loading.gif" alt="Loading..." />
    </div>
    <div v-else>
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
        <div v-for="(entry, index) in entries.filter(e => e.day === day)" :key="index" class="entry-group" :name="`entry-${entry.date}-${entry.no}`">
          <input type="text" :value="entry.sa" hidden/>
          <input type="text" :value="entry.date" hidden />
          <input type="text" :value="entry.no" hidden />
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" :name="`kondisi-${entry.date}-${entry.no}`" value="OFF" @change="handleKondisi(entry.day, index, $event)" :checked="entry.pilih === 'OFF'" />
              OFF
            </label>
            <label class="radio-label">
              <input type="radio" :name="`kondisi-${entry.date}-${entry.no}`" value="Normal" @change="handleKondisi(entry.day, index, $event)" :checked="entry.pilih === 'Normal'" />
              Normal
            </label>
            <label class="radio-label">
              <input type="radio" :name="`kondisi-${entry.date}-${entry.no}`" value="Perbantuan" @change="handleKondisi(entry.day, index, $event)" :checked="entry.pilih === 'Perbantuan'" />
              Perbantuan
            </label>
            <label class="checkbox-label"  :disabled="entry.pilih === 'OFF'">
              <input type="checkbox" :name="`checkbox-kirim-${entry.date}-${entry.no}`" @change="handleKirimChange(entry.day, index, $event)" :disabled="entry.pilih === '' || entry.pilih === 'OFF'" /> Kirim Barang
            </label>
          </div>
          <input type="text" :name="`input-keterangan-${entry.date}-${entry.no}`" class="selectcustom" v-if="entry.pilih === 'OFF'" @change="handleKeterangan(entry.day, index, $event)" :value="entry.ket" placeholder="Keterangan"  />
          <select class="selectcustom" :name="`select-store-${entry.date}-${entry.no}`" @change="handleStoreChange(entry.day, index, $event)" :disabled="entry.pilih === ''" :hidden="entry.pilih === 'OFF'" >
            <option value="" hidden>Select Store</option>
            <option v-for="item in (entry.pilih === 'Normal' ? normalStores : perbantuanStores)" :key="item" :value="item">{{ item }}</option>
          </select>
          <select class="selectcustom" :name="`select-schedule-${entry.date}-${entry.no}`" @change="handleScheduleChange(entry.day, index, $event)" :hidden="entry.store === 'OFF' || entry.store === ''" >
            <option value="" hidden>Select Schedule</option>
            <option value="P">P</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="INV">INV</option>
          </select>
          <div class="time-picker-group">
            <input type="time" class="selectcustom" :name="`time-masuk-${entry.date}-${entry.no}`" @change="handleMasukChange(entry.day, index, $event)" :hidden="entry.schedule === 'OFF' || entry.store === ''" step="3600" />
            <input type="time" class="selectcustom" :name="`time-pulang-${entry.date}-${entry.no}`" @change="handlePulangChange(entry.day, index, $event)" :hidden="entry.schedule === 'OFF' || entry.store === ''" step="3600" />
          </div>
          <button class="removeButton" @click="removeEntry(`*-${entry.date}-${entry.no}`)">X</button>
        </div>
        <button class="addButton" @click="addEntry(day)" :disabled="isAddButtonDisabled(day)">+</button>
      </div>
      <button class="submitButton" @click="handleSubmit()">Submit</button>
    </div>
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
      normalStores: [],
      perbantuanStores: [],
      entries: [],
      daysInMonth: 0,
      nextMonthName: '',
      nextYear: 0,
      loading: true,
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
    if (this.username === "") {
      this.$router.push('/');
    } else {
      this.fetchSa();
      this.calculateDaysInNextMonth();
    }
  },
  methods: {
    getFormattedDate() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
    },
    showToast() {
      this.$notify("Hello user!");
    },
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

      await this.fetchStores();
      this.loading = false;
    },
    async fetchStores() {
      const { data: normalData } = await supabase
        .from('db_consignment')
        .select('destinationName')
        .eq('sub2RegionName', this.sa);

      const { data: perbantuanData } = await supabase
        .from('db_consignment')
        .select('destinationName')
        .neq('sub2RegionName', this.sa);

      if (normalData) {
        this.normalStores = normalData.map(item => item.destinationName);
      }

      if (perbantuanData) {
        this.perbantuanStores = perbantuanData.map(item => item.destinationName);
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
        transaction: `${this.getFormattedDate()}`,
        date: `${this.nextYear}-${(new Date().getMonth() + 2).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} 00:00:00.000`,
        no: this.entries.filter(e => e.day === day).length + 1,
        pilih: '',
        store: '',
        schedule: '',
        masuk: '',
        pulang: '',
        kirim: '',
      };
      this.entries.push(newEntry);
    },
    async handleKondisi(day, index, event) {
      const value = event.target.value;
      this.entries = this.entries.map(entry => {
        if (entry.day === day && entry.no === index + 1) {
          return {
            ...entry,
            pilih: value,
            store: value === 'OFF' ? 'OFF' : entry.store,
            schedule: value === 'OFF' ? 'OFF' : entry.schedule,
            masuk: value === 'OFF' ? 'OFF' : entry.masuk,
            pulang: value === 'OFF' ? 'OFF' : entry.pulang
          };
        }
        return entry;
      });
    },
    handleScheduleChange(day, index, event) {
      const value = event.target.value;
      this.entries = this.entries.map(entry => {
        if (entry.day === day && entry.no === index + 1) {
          return { ...entry, schedule: value };
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
    handleKirimChange(day, index, event) {
      const value = event.target.checked ? 'K' : null;
      this.entries = this.entries.map(entry => {
        if (entry.day === day && entry.no === index + 1) {
          return { ...entry, kirim: value };
        }
        return entry;
      });
    },
    handleKeterangan(day, index, event) {
      const value = event.target.value;
      this.entries = this.entries.map(entry => {
        if (entry.day === day && entry.no === index + 1) {
          return { ...entry, ket: value };
        }
        return entry;
      });
    },
    removeEntry(namePattern) {
      const regex = new RegExp(`^${namePattern.replace(/\*/g, '.*')}$`);
      this.entries = this.entries.filter(entry => {
        const entryName = `entry-${entry.date}-${entry.no}`;
        return !regex.test(entryName);
      });
    },
    isAddButtonDisabled(day) {
      const entriesForDay = this.entries.filter(e => e.day === day);
      return entriesForDay.some(entry =>
      entry.pilih === 'OFF' || entry.pilih === '' || entry.store === '' || entry.schedule === '' || entry.masuk === '' || entry.pulang === ''
      );
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
        this.$notify(missingDaysMessage);
      } else {
        // Buat tabel HTML
        const table = document.createElement('table');
        table.border = '1';

        // Buat header tabel
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['No.', 'SA', 'Transaction', 'Date', 'Number', 'Kondisi', 'Store', 'Schedule', 'Masuk', 'Pulang', 'Kirim Barang', 'Keterangan'];
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

        //insert supabase
        const entriesWithId = this.entries.map((entry, index) => ({
          no: entry.day,
          sa: Array.isArray(entry.sa) ? entry.sa[0] : entry.sa,
          date: entry.date,
          transaction: entry.transaction,
          pilih: entry.pilih,
          number: entry.no,
          store: entry.store,
          schedule: entry.schedule,
          masuk: entry.masuk,
          pulang: entry.pulang,
          kirimbarang: entry.kirim,
          keterangan: entry.ket
        }));

        supabase
          .from('db_schedule_sa')
          .insert(entriesWithId)
          .then(response => {
            this.$notify(`Data telah di tambahkan ke Database : ${response}`);

            // Buat file CSV
            const csvContent = `SPC,${this.spc}\nSA,${this.sa}\n\nNo.,SA,Transaction,Date,Number,Kondisi,Store,Schedule,Masuk,Pulang,Kirim Barang,Keterangan\n` +
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

            // Tampilkan dialog sukses
            alert('Data berhasil disubmit ke Supabase. Anda akan dialihkan ke halaman login.');
            this.$router.push('/');
          })
          .catch(error => {
            this.$notify(`Data gagal di tambahkan ke Database : ${error}`);
          });
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

.radio-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-radius: 50%;
  outline: none;
  cursor: pointer;
}

.radio-label input[type="radio"]:checked {
  border-color: #007bff;
  background-color: #007bff;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-radius: 4px;
  outline: none;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"]:checked {
  border-color: #007bff;
  background-color: #007bff;
}

.checkbox-label input[type="checkbox"]:checked::after {
  content: '\2713'; /* Tanda centang */
  color: white;
  font-size: 14px;
  position: relative;
  left: 3px;
  top: -2px;
}

.time-picker-group {
  display: flex;
  gap: 10px;
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

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.loading img {
  width: 50px;
  height: 50px;
}
</style>
