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
        <select class="selectcustom" @change="handleKondisi(entry.day, index, $event)" >
          <option value="">Kondisi</option>
          <option value="Normal">Normal</option>
          <option value="Perbantuan">Perbantuan</option>
          <option value="OFF">OFF</option>
        </select>
        <input type="text" class="selectcustom" v-if="entry.pilih === 'OFF'" @change="handleKeterangan(entry.day, index, $event)" :value="entry.ket" placeholder="Keterangan" />
        <select class="selectcustom" @change="handleStoreChange(entry.day, index, $event)" :disabled="entry.pilih === ''" :hidden="entry.pilih === 'OFF'">
          <option value="" hidden>Select Store</option>
          <option v-for="item in store" :key="item" :value="item">{{ item }}</option>
        </select>
        <select class="selectcustom" @change="handleScheduleChange(entry.day, index, $event)" :hidden="entry.store === 'OFF' || entry.store === ''">
          <option value="" hidden>Select Schedule</option>
          <option value="P">P</option>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="INV">INV</option>
        </select>
        <select class="selectcustom" @change="handleMasukChange(entry.day, index, $event)" :hidden="entry.schedule === 'OFF' || entry.store === ''">
          <option value="" hidden>Select Masuk</option>
          <option value="6:00">6:00</option>
          <option value="6:30">6:30</option>
          <option value="7:00">7:00</option>
          <option value="7:30">7:30</option>
          <option value="8:00">8:00</option>
          <option value="8:30">8:30</option>
          <option value="9:00">9:00</option>
          <option value="9:30">9:30</option>
          <option value="10:00">10:00</option>
          <option value="10:30">10:30</option>
          <option value="11:00">11:00</option>
          <option value="11:30">11:30</option>
          <option value="12:00">12:00</option>
          <option value="12:30">12:30</option>
          <option value="13:00">13:00</option>
          <option value="13:30">13:30</option>
          <option value="14:00">14:00</option>
          <option value="14:30">14:30</option>
        </select>
        <select class="selectcustom" @change="handlePulangChange(entry.day, index, $event)" :hidden="entry.schedule === 'OFF' || entry.store === ''">
          <option value="" hidden>Select Pulang</option>
          <option value="14:00">14:00</option>
          <option value="14:30">14:30</option>
          <option value="15:00">15:00</option>
          <option value="15:30">15:30</option>
          <option value="16:00">16:00</option>
          <option value="16:30">16:30</option>
          <option value="17:00">17:00</option>
          <option value="17:30">17:30</option>
          <option value="18:00">18:00</option>
          <option value="18:30">18:30</option>
          <option value="19:00">19:00</option>
          <option value="19:30">19:30</option>
          <option value="20:00">20:00</option>
          <option value="20:30">20:30</option>
          <option value="21:00">21:00</option>
          <option value="21:30">21:30</option>
          <option value="22:00">22:00</option>
          <option value="22:30">22:30</option>
        </select>        
        <label :hidden="entry.pilih === 'OFF'">
          <input type="checkbox" @change="handleKirimChange(entry.day, index, $event)" :disabled="entry.pilih === ''" :hidden="entry.pilih === 'OFF'" /> Kirim Barang
        </label>
        <button class="removeButton" @click="removeEntry(day, index)">X</button>
      </div>
      <button class="addButton" @click="addEntry(day)" :disabled="isAddButtonDisabled(day)">+</button>
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

      await this.fetchStore(this.sa, false);
    },
    async fetchStore(sa, isPerbantuan) {
      let query = supabase.from('db_consignment').select('destinationName');

      if (!isPerbantuan) {
        query = query.eq('sub2RegionName', sa);
      }

      const { data } = await query;

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

      // Memanggil fetchStore dengan parameter yang sesuai
      const entry = this.entries.find(e => e.day === day && e.no === index + 1);
      if (entry) {
        let isPerbantuan;
        if (entry.pilih === 'Normal') {
          isPerbantuan = false;
        } else if (entry.pilih === 'Perbantuan') {
          isPerbantuan = true;
        }
        await this.fetchStore(entry.sa, isPerbantuan);
      }
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
    removeEntry(day, index) {
      this.entries = this.entries.filter((entry, entryIndex) => {
        return !(entry.day === day && entryIndex === index);
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
          })
          .catch(error => {
            this.$notify(`Data gagal di tambahkan ke Database : ${error}`);
          });

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
