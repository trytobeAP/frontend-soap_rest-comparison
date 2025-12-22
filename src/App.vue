<template>
  <v-app>
    <v-app-bar
      color="blue-grey-darken-4"
      elevation="3"
    >
      <template v-slot:prepend>
        <v-icon
          icon="mdi-compare-horizontal"
          size="large"
        />
      </template>
      <v-app-bar-title class="font-weight-bold">
        SOAP vs REST Comparison
      </v-app-bar-title>
    </v-app-bar>

    <v-main class="bg-grey-lighten-2">
      <v-container
        fluid
        class="pa-6"
      >
        <!-- ПАНЕЛЬ УПРАВЛЕНИЯ ДАННЫМИ -->
        <v-card
          class="mb-6"
          elevation="2"
          border
        >
          <v-card-text>
            <div class="d-flex align-center flex-wrap gap-4">
              <strong class="text-h6 mr-4">🗄️ База данных:</strong>

              <!-- СЧЕТЧИК ЗАПИСЕЙ -->
              <v-chip
                class="mr-1"
                variant="flat"
                size="large"
                color="blue-grey"
                label
              >
                <v-icon
                  start
                  icon="mdi-table-account"
                />
                {{ dbCount }} записей
              </v-chip>

              <v-divider
                class="mr-2 ml-1"
                vertical
              />

              <v-btn-group
                variant="outlined"
                divided
              >
                <v-btn
                  prepend-icon="mdi-database-plus"
                  :loading="seeding"
                  @click="seed(100)"
                >
                  +100
                </v-btn>
                <v-btn
                  :loading="seeding"
                  @click="seed(1000)"
                >
                  +1k
                </v-btn>
                <v-btn
                  :loading="seeding"
                  @click="seed(5000)"
                >
                  +5k
                </v-btn>
              </v-btn-group>

              <v-spacer />

              <v-btn
                color="red-darken-1"
                variant="flat"
                prepend-icon="mdi-delete-alert"
                :loading="clearing"
                @click="clearDb"
              >
                Очистить всё
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <ServicePanel
              title="REST Service"
              color="blue-darken-1"
              protocol="REST"
              icon="mdi-web"
              :fetch-action="restService.getAll"
              :create-action="restService.create"
            />
          </v-col>

          <v-col
            cols="12"
            md="6"
          >
            <ServicePanel
              title="SOAP Service"
              color="deep-orange-darken-1"
              protocol="SOAP"
              icon="mdi-xml"
              :fetch-action="soapService.getAll"
              :create-action="soapService.create"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import ServicePanel from "@/components/ServicePanel.vue";
import { restService } from "@/api/rest.service";
import { soapService } from "@/api/soap.service";

// Логика админки
const seeding = ref(false);
const clearing = ref(false);
const dbCount = ref(0);
const API_BASE = "http://localhost:8000/api/admin";

const fetchStats = async () => {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    const data = await res.json();
    dbCount.value = data.count;
  } catch (e) {
    console.error("Ошибка получения статистики", e);
  }
};

const seed = async (count: number) => {
  seeding.value = true;
  try {
    await fetch(`${API_BASE}/seed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count }),
    });
    await fetchStats();
  } catch (e) {
    alert("Ошибка генерации");
  } finally {
    seeding.value = false;
  }
};

const clearDb = async () => {
  if (!confirm("Удалить все записи?")) return;

  clearing.value = true;
  try {
    await fetch(`${API_BASE}/clear`, { method: "POST" });
    await fetchStats(); // Обновляем счетчик (станет 0)
  } catch (e) {
    alert("Ошибка очистки");
  } finally {
    clearing.value = false;
  }
};

onMounted(() => {
  fetchStats();
});
</script>
